import os
import yt_dlp
from typing import List, Dict
import glob

def fetch_videos(channel_url: str, type: str = 'shorts') -> List[Dict]:
    """
    Fetches video list from a channel or playlist using yt-dlp.
    type: 'shorts' or 'long' (video)
    """
    ydl_opts = {
        'extract_flat': True, # Do not download, just list
        'quiet': True,
        'ignoreerrors': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            result = ydl.extract_info(channel_url, download=False)
            
            if 'entries' in result:
                videos = []
                for entry in result['entries']:
                    if entry:
                        videos.append({
                            'id': entry.get('id'),
                            'title': entry.get('title'),
                            'url': entry.get('url') or f"https://www.youtube.com/watch?v={entry.get('id')}",
                            'duration': entry.get('duration'),
                            'thumbnail': entry.get('thumbnail') # Useful for UI
                        })
                return videos
        except Exception as e:
            print(f"Error fetching videos: {e}")
            return []
            
    return []

def process_local_folder(folder_path: str) -> List[Dict]:
    """
    Scans a local folder for video files and returns them as a list.
    """
    videos = []
    if not os.path.exists(folder_path):
        return []
        
    # Supported extensions
    extensions = ['*.mp4', '*.mov', '*.avi', '*.mkv']
    
    for ext in extensions:
        # Recursive search? or top level? Top level for now.
        files = glob.glob(os.path.join(folder_path, ext))
        for f in files:
            # Get stats
            stats = os.stat(f)
            videos.append({
                'id': os.path.basename(f),
                'title': os.path.basename(f),
                'url': f, # Local path as URL
                'size': stats.st_size,
                'path': f
            })
            
    return videos

def download_video(url: str, output_path: str, extract_subs: bool = True) -> Dict:
    """
    Downloads a video and optionally extracts subtitles.
    Returns dictionary with file paths.
    """
    # If URL is local path, just return it or copy it
    if os.path.exists(url):
        import shutil
        filename = os.path.basename(url)
        dest = os.path.join(output_path, filename)
        if not os.path.exists(dest):
             shutil.copy(url, dest)
             
        return {
            'video_path': dest,
            'title': filename,
            'id': filename
        }

    if not os.path.exists(output_path):
        os.makedirs(output_path)

    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': f'{output_path}/%(id)s.%(ext)s',
        'quiet': False, # Allow logs to show progress
        'overwrites': True,
        'writesubtitles': extract_subs,
        'writeautomaticsub': extract_subs,
        'subtitleslangs': ['en', 'ar'], 
        'postprocessors': [{
            'key': 'FFmpegEmbedSubtitle',
        }] if extract_subs else [],
    }

    info = {}
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info_dict)
            info['video_path'] = filename
            info['title'] = info_dict.get('title')
            info['id'] = info_dict.get('id')
    except Exception as e:
        # Fallback or re-raise
        raise e
    
    return info
