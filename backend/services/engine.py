import json
import os
import time
from .youtube import download_video
from .ai import translate_text, generate_voiceover, transcribe_video
from .media import mute_video, merge_tracks, trim_video, adjust_volume, insert_clips

PROJECTS_DB = "storage/projects.json"

def update_project_status(project_id, status, progress=0, message="", final_video=None):
    if not os.path.exists("storage"):
        os.makedirs("storage")
    
    projects = {}
    if os.path.exists(PROJECTS_DB):
        try:
            with open(PROJECTS_DB, 'r', encoding='utf-8') as f:
                projects = json.load(f)
        except:
            pass
    
    if project_id not in projects:
        projects[project_id] = {
            "id": project_id,
            "created_at": time.time(),
            "name": f"Project {project_id}",
            "status": "pending",
            "progress": 0,
            "log": []
        }
    
    projects[project_id]["status"] = status
    if progress > 0:
        projects[project_id]["progress"] = progress
    if message:
        projects[project_id]["log"].append(f"{time.strftime('%H:%M:%S')} - {message}")
    if final_video:
        projects[project_id]["output_video"] = final_video
        
    with open(PROJECTS_DB, 'w', encoding='utf-8') as f:
        json.dump(projects, f, indent=4, ensure_ascii=False)


async def process_video(video_url: str, steps: list, config: dict, project_id: str):
    """
    Orchestrates the workflow for a single video.
    """
    project_dir = f"storage/projects/{project_id}"
    if not os.path.exists(project_dir):
        os.makedirs(project_dir)
        
    log = []
    
    # Workflow Context
    ctx = {
        "video_path": None,
        "audio_path": None, # If separated or TTS
        "subtitle_text": None,
        "subtitle_path": None,
        "original_video_path": None
    }
    
    # API Keys
    api_keys = config.get('keys', {})
    
    try:
        total_steps = len(steps)
        
        # --- Step 1: Pre-download (Implicit or Explicit Source Node) ---
        # Usually Source/Download is the first step or handled before loop
        # We assume the first valid step with type 'source' or 'download' triggers this
        
        update_project_status(project_id, "processing", 5, f"Starting workflow for {video_url}")

        # Initial Download (Always needed if URL provided)
        if video_url:
            update_project_status(project_id, "processing", 10, f"Downloading video...")
            video_info = download_video(video_url, project_dir)
            ctx["video_path"] = video_info['video_path']
            ctx["original_video_path"] = video_info['video_path']
            update_project_status(project_id, "processing", 15, "Download complete.")
        
        # Execute Steps
        for i, step in enumerate(steps):
            step_type = step.get('type')
            step_data = step.get('data', {})
            step_label = step_data.get('label', step_type)
            
            progress = 15 + int((i / total_steps) * 80)
            update_project_status(project_id, "processing", progress, f"Running: {step_label}")
            
            print(f"Executing step {i}: {step_type} - {step_data}")

            # ----------------------------------------------------
            # EDIT NODE
            # ----------------------------------------------------
            if step_type == 'edit':
                current_video = ctx["video_path"]
                output_video = f"{project_dir}/edit_{i}.mp4"
                
                # 1. Trim
                trim_start = float(step_data.get('trimStart', 0))
                trim_end = float(step_data.get('trimEnd', 0)) # 0 means no trim from end usually, or if logic dictates
                
                # If trim needed
                if trim_start > 0 or trim_end > 0:
                    # Calculate duration for end trim
                    # For now `trim_video` handles logic.
                    # If trimEnd is "seconds from end", we need video duration.
                    # Assuming trimStart/End are timestamps for now based on PropertyInspector?
                    # "trimStart": "Cut from start (sec)" -> Duration 
                    # "trimEnd": "Cut from end (sec)"
                    # media.py trim_video uses start/end as timestamps. 
                    # We need to adapt logic.
                    
                    # If user means "remove first 5s", start=5.
                    # If user means "remove last 5s", end = Duration - 5.
                    import ffmpeg
                    try:
                        probe = ffmpeg.probe(current_video)
                        duration = float(probe['format']['duration'])
                        
                        start_time = trim_start
                        end_time = duration - trim_end if trim_end > 0 else None
                        
                        if end_time and end_time < start_time:
                            end_time = None # Invalid range protection
                            
                        trim_video(current_video, output_video, start_time, end_time)
                        current_video = output_video 
                    except:
                        pass # Probe failed

                # 2. Volume
                volume = step_data.get('volume', 100)
                mute = step_data.get('mute', False)
                if mute:
                    temp_out = f"{project_dir}/mute_{i}.mp4"
                    mute_video(current_video, temp_out)
                    current_video = temp_out
                elif volume != 100:
                    temp_out = f"{project_dir}/vol_{i}.mp4"
                    adjust_volume(current_video, temp_out, volume)
                    current_video = temp_out
                
                # 3. Inserts
                inserts = step_data.get('inserts', [])
                if inserts:
                    temp_out = f"{project_dir}/ins_{i}.mp4"
                    # inserts list of {time, file}
                    cleaned_inserts = []
                    for ins in inserts:
                        # Ensure absolute path or resolve
                        fpath = ins.get('file')
                        # Check if file exists, if not relative to project?
                        cleaned_inserts.append({'time': float(ins['time']), 'file': fpath})
                        
                    insert_clips(current_video, cleaned_inserts, temp_out)
                    current_video = temp_out
                
                ctx["video_path"] = current_video

            # ----------------------------------------------------
            # TRANSCRIBE NODE
            # ----------------------------------------------------
            elif step_type == 'transcribe':
                # Use resolved key from frontend if available, else global
                provider = 'openai' # Default provider for transcribe
                key = step_data.get('resolvedKey') or api_keys.get(provider)
                
                if key:
                    transcript_text = transcribe_video(ctx["video_path"], provider, key)
                    ctx["subtitle_text"] = transcript_text
                    sub_path = f"{project_dir}/transcript_{i}.txt"
                    with open(sub_path, 'w', encoding='utf-8') as f:
                        f.write(transcript_text)
                    ctx["subtitle_path"] = sub_path
                else:
                    update_project_status(project_id, "processing", progress, "Skipping transcription: No API Key")

            # ----------------------------------------------------
            # TRANSLATE NODE
            # ----------------------------------------------------
            elif step_type == 'translate':
                layout = step_data.get('targetLang', 'ar')
                text = ctx.get("subtitle_text")
                if text:
                    provider = step_data.get('selectedProvider') or config.get('translationProvider', 'openai')
                    key = step_data.get('resolvedKey') or api_keys.get(provider)
                    
                    if key:
                        trans_text = translate_text(text, layout, provider, key)
                        ctx["subtitle_text"] = trans_text 
                        
                        trans_path = f"{project_dir}/translation_{i}.txt"
                        with open(trans_path, 'w', encoding='utf-8') as f:
                            f.write(trans_text)
                    else:
                         update_project_status(project_id, "processing", progress, "Skipping translation: No API Key")
                else:
                    pass # No text to translate

            # ----------------------------------------------------
            # TTS NODE (Text Info Speech)
            # ----------------------------------------------------
            elif step_type == 'tts':
                voice = step_data.get('voice', 'alloy')
                speed = step_data.get('speed', 1.0) # Not supported by OpenAI API natively yet directly in simple call, but ignored for now
                text = ctx.get("subtitle_text")
                
                if text:
                    provider = step_data.get('selectedProvider') or config.get('ttsProvider', 'openai')
                    key = step_data.get('resolvedKey') or api_keys.get(provider)
                    
                    if key:
                        audio_file = generate_voiceover(text, voice, provider, key)
                        if audio_file:
                            ctx["audio_path"] = audio_file
                    else:
                        update_project_status(project_id, "processing", progress, "Skipping TTS: No API Key")

            # ----------------------------------------------------
            # MERGE / COMPOSER NODE
            # ----------------------------------------------------
            elif step_type == 'merge' or step_type == 'composer':
                # Combine what we have
                output_merge = f"{project_dir}/merged_{i}.mp4"
                
                # Determine inputs
                # Ideally we check connections, but simple serialized steps imply flow
                video_in = ctx["video_path"]
                audio_in = ctx.get("audio_path")
                # If no new audio, keep original (handled by merge logic? No, merge takes specific inputs)
                
                # If audio_in is None, we might want to keep original audio?
                # merge_tracks logic: if audio_path provided, it uses it.
                # If we want original audio + new audio, we need complex mixing.
                # For now, let's assume replacement if TTS was generated.
                
                if not audio_in:
                    # If we didn't generate new audio, merge function expects an audio track or we just skip merge?
                    # If we just modified video (Edit node), ctx['video_path'] is already updated.
                    # Merge Node typically signifies "Put it all together"
                    pass
                
                merge_tracks(video_in, audio_in if audio_in else video_in, output_merge) # If no new audio, re-merge original?
                
                # Logic fix:
                # If we have specific audio_path (TTS), we merge it.
                # If not, we just pass video through or ensure audio exists.
                if audio_in:
                     merge_tracks(video_in, audio_in, output_merge)
                     ctx["video_path"] = output_merge
                
            # ----------------------------------------------------
            # RENDER NODE
            # ----------------------------------------------------
            elif step_type == 'render':
                # Finalize
                final_path = f"{project_dir}/final_output.mp4"
                import shutil
                shutil.copy(ctx["video_path"], final_path)
                ctx["video_path"] = final_path

        update_project_status(project_id, "completed", 100, "Workflow finished successfully", ctx["video_path"])
        return {"status": "success", "final_video": ctx["video_path"], "log": log}

    except Exception as e:
        import traceback
        traceback.print_exc()
        update_project_status(project_id, "failed", 0, str(e))
        return {"status": "error", "error": str(e), "log": log}
