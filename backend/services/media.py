import ffmpeg
import os
import shutil

def get_video_duration(path: str) -> float:
    try:
        probe = ffmpeg.probe(path)
        return float(probe['format']['duration'])
    except:
        return 0

def trim_video(input_path: str, output_path: str, start: float, end: float = None):
    """
    Trims the video from start to end.
    if end is None or 0, it goes to the end of the video.
    """
    try:
        stream = ffmpeg.input(input_path)
        
        # Apply trim
        if end and end > 0:
            vid = stream.video.trim(start=start, end=end).setpts('PTS-STARTPTS')
            aud = stream.audio.filter_('atrim', start=start, end=end).filter_('asetpts', 'PTS-STARTPTS')
        else:
            vid = stream.video.trim(start=start).setpts('PTS-STARTPTS')
            aud = stream.audio.filter_('atrim', start=start).filter_('asetpts', 'PTS-STARTPTS')
            
        out = ffmpeg.output(vid, aud, output_path)
        out.run(overwrite_output=True, quiet=True)
        return True
    except Exception as e:
        print(f"Error trimming video: {e}")
        return False

def adjust_volume(input_path: str, output_path: str, volume_percent: int):
    """
    Adjusts audio volume. volume_percent: 100 is normal, 0 is mute, 200 is double.
    """
    try:
        vol_factor = volume_percent / 100.0
        stream = ffmpeg.input(input_path)
        
        # We process audio, copy video
        # Exception: if volume is 0, just remove audio track? Or silent?
        # Better to filter volume=0
        
        out = ffmpeg.output(stream.video, stream.audio.filter('volume', volume=vol_factor), output_path)
        out.run(overwrite_output=True, quiet=True)
        return True
    except Exception as e:
        print(f"Error adjusting volume: {e}")
        return False

def mute_video(input_path: str, output_path: str):
    """
    Removes audio from the video.
    """
    try:
        (
            ffmpeg
            .input(input_path)
            .output(output_path, an=None, vcodec='copy')
            .overwrite_output()
            .run(quiet=True)
        )
        return True
    except Exception as e:
        print(f"Error muting video: {e}")
        return False

def insert_clips(main_video_path: str, inserts: list, output_path: str):
    """
    Inserts clips at specific timestamps.
    inserts: list of dict {'time': float, 'file': str}
    """
    # Sort inserts by time
    inserts.sort(key=lambda x: x['time'])
    
    try:
        # We need to slice the main video into chunks and interleave inserts
        # Chunk 1: 0 to T1 -> Insert 1 -> Chunk 2: T1 to T2 -> Insert 2 ...
        
        inputs = []
        last_time = 0
        
        main_duration = get_video_duration(main_video_path)
        
        # Temporary files for chunks to avoid complex filter graphs
        temp_files = []
        
        base_dir = os.path.dirname(output_path)
        
        for i, insert in enumerate(inserts):
            t = insert['time']
            clip_path = insert['file']
            
            # Segment from Main Video
            if t > last_time:
                seg_path = os.path.join(base_dir, f"temp_seg_{i}.mp4")
                trim_video(main_video_path, seg_path, last_time, t)
                inputs.append(ffmpeg.input(seg_path))
                temp_files.append(seg_path)
            
            # The Insert Clip
            # Ideally resize insert to match main video resolution, but for now just input it
            # Assuming compatible formats
            inputs.append(ffmpeg.input(clip_path))
            
            last_time = t
            
        # Final segment
        if last_time < main_duration:
            seg_path = os.path.join(base_dir, f"temp_seg_final.mp4")
            trim_video(main_video_path, seg_path, last_time, None)
            inputs.append(ffmpeg.input(seg_path))
            temp_files.append(seg_path)
            
        # Concat
        # We need to construct the stream list properly for concat
        # concat(v=1, a=1)
        
        # Note: ffmpeg.concat requires unpacked streams
        # We need to separate video and audio streams for each input
        streams = []
        for inp in inputs:
            streams.append(inp.video)
            streams.append(inp.audio)
            
        # This is tricky with python-ffmpeg wrapper for varying inputs
        # Alternative: use file list concat demuxer if all are same format
        # Or simpler filter complex
        
        # Simplified: Just chain them using concat filter
        # .concat(input1, input2, ...)
        
        joined = ffmpeg.concat(*inputs, v=1, a=1).node
        out = ffmpeg.output(joined[0], joined[1], output_path)
        out.run(overwrite_output=True, quiet=True)
        
        # Cleanup
        for f in temp_files:
            if os.path.exists(f):
                os.remove(f)
                
        return True
        
    except Exception as e:
        print(f"Error inserting clips: {e}")
        return False

def merge_tracks(video_path: str, audio_path: str, output_path: str, subtitles_path: str = None):
    """
    Merges video, new audio (replacing or mixing), and subtitles.
    """
    try:
        inp_v = ffmpeg.input(video_path)
        inp_a = ffmpeg.input(audio_path)
        
        opts = {
            'vcodec': 'copy', 
            'acodec': 'aac', 
            'strict': 'experimental'
        }
        
        # If subtitles provided
        if subtitles_path and os.path.exists(subtitles_path):
            # Soft subtitles (MKV/MP4 container)
            # For burning subtitles, we'd use vf='subtitles=filename'
            # Let's use soft subs for flexibility, or hardcode if user wants
            
            # Only MKV supports reliable soft subs usually, but mp4 works with mov_text
            # Let's try to pass it as an input
            inp_s = ffmpeg.input(subtitles_path)
            
            out = ffmpeg.output(
                inp_v, inp_a, inp_s, 
                output_path, 
                **opts, 
                c='copy', # Try copy first
                # updated scheme: -c:v copy -c:a aac -c:s mov_text
            )
            # Re-define to ensure correct codecs
            out = ffmpeg.output(
                inp_v, inp_a, inp_s,
                output_path,
                vcodec='copy',
                acodec='aac',
                scodec='mov_text' 
            )
        else:
            # Just Video + Audio
            # We map 0:v (video from first input) and 1:a (audio from second input)
            out = ffmpeg.output(
                inp_v.video, inp_a.audio,
                output_path,
                vcodec='copy',
                acodec='aac'
            )

        out.run(overwrite_output=True, quiet=True)
        return True
    except Exception as e:
        print(f"Error merging tracks: {e}")
        return False

def merge_audio(video_path: str, audio_path: str, output_path: str):
    return merge_tracks(video_path, audio_path, output_path)
