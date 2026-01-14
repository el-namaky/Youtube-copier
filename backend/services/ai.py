import os
import google.generativeai as genai
from openai import OpenAI
# from google.cloud import texttospeech # Optional, not used yet consistently

def transcribe_video(video_path: str, provider: str, api_key: str) -> str:
    """
    Transcribes audio from video file.
    """
    # Extract audio first? OpenAI Whisper accepts mp3, mp4, etc. 25MB limit.
    # Ideally we should extract audio to a smaller mp3 file to ensure we don't hit size limits.
    
    try:
        if not os.path.exists(video_path):
            return "Error: File not found"

        if provider == 'openai':
            client = OpenAI(api_key=api_key)
            
            # Open file
            with open(video_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1", 
                    file=audio_file,
                    response_format="text" # or 'srt' if we want subtitles directly
                )
            return transcript
        
        elif provider == 'gemini':
            # Gemini 1.5 Pro allows audio upload.
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # File API upload needed for Gemini multimedia
            # checking if we can just send text for now or mock it
            # For real implementation we need:
            # myfile = genai.upload_file(video_path)
            # result = model.generate_content([myfile, "Transcribe this audio"])
            
            return "[Gemini Transcription Placeholder - Requires File API Implementation]"
            
    except Exception as e:
        return f"Error during transcription: {str(e)}"

    return "No valid provider selected"

def translate_text(text: str, target_lang: str, provider: str, api_key: str) -> str:
    """
    Translates text using the selected provider (openai, gemini, google).
    """
    if not text:
        return ""

    if provider == 'openai':
        try:
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are a professional translator. Translate the following text to {target_lang}. Return ONLY the translated text."},
                    {"role": "user", "content": text}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Translation Error: {e}"
    
    elif provider == 'gemini':
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(f"Translate this text to {target_lang}: {text}")
            return response.text
        except Exception as e:
            return f"Translation Error: {e}"
    
    return text  # Fallback

def generate_voiceover(text: str, voice_id: str, provider: str, api_key: str) -> str:
    """
    Generates audio file from text. Returns path to the audio file.
    """
    # Use a persistent storage path
    filename = f"voice_{abs(hash(text))[:10]}.mp3"
    output_dir = "storage/temp_voice"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    output_path = os.path.join(output_dir, filename)
    
    if os.path.exists(output_path):
        return output_path
    
    if provider == 'openai':
        try:
            client = OpenAI(api_key=api_key)
            response = client.audio.speech.create(
                model="tts-1",
                voice=voice_id, 
                input=text
            )
            response.stream_to_file(output_path)
            return output_path
        except Exception as e:
            print(f"TTS Error (OpenAI): {e}")
            return None
            
    elif provider == 'elevenlabs':
        import requests
        CHUNK_SIZE = 1024
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": api_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                        if chunk:
                            f.write(chunk)
                return output_path
            else:
                print(f"TTS Error (ElevenLabs): {response.text}")
                return None
        except Exception as e:
             print(f"TTS Error (ElevenLabs): {e}")
             return None
        
    return None

def analyze_video(video_path: str, prompt: str, provider: str, api_key: str) -> str:
    """
    Analyzes video content using Vision APIs.
    """
    if provider == 'gemini':
        try:
            genai.configure(api_key=api_key)
            # In a real app, upload the file using genai.upload_file(video_path)
            # For now returning a mock or text based analysis if simple
            return "Video analysis requires Gemini File API upload implementation."
        except Exception as e:
            return f"Analysis Error: {e}"
        
    return "Analysis Not Supported for this provider"
