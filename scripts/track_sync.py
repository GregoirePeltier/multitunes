import json
import requests
import logging
import argparse
from tqdm import tqdm
from typing import Dict, List, Optional
from pathlib import Path


class TrackSynchronizer:
    def __init__(self, server_url: str, json_file_path: str, jwt_token: str):
        self.server_url = server_url
        self.json_file_path = json_file_path
        self.headers = {
            'Authorization': f'Bearer {jwt_token}',
            'Content-Type': 'application/json'
        }
        self.logger = logging.getLogger(__name__)

    def load_local_tracks(self) -> Dict:
        """Load tracks from local JSON file"""
        try:
            with open(self.json_file_path, 'r') as file:
                if (self.json_file_path.endswith(".jsonl")):
                    return [json.loads(t) for t in file]
                return json.load(file)

        except FileNotFoundError:
            self.logger.error(f"JSON file not found: {self.json_file_path}")
            return {}
        except json.JSONDecodeError:
            self.logger.error(
                f"Invalid JSON format in file: {self.json_file_path}")
            return {}

    def get_server_tracks(self) -> List:
        """Fetch tracks from the server"""
        try:
            print("querying ",self.server_url)
            response = requests.get(
                f"{self.server_url}/tracks",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            self.logger.error(f"Failed to fetch tracks from server: {e}")
            return None
    def get_server_version(self,track_data):
        return {
                    "title":track_data["title_short"],
                    "artist":track_data["artist"]["name"],
                    "cover":track_data["album"]["cover_medium"],
                    "source":"deezer",
                    "sourceUrl":track_data["link"],
                    "sourceId":track_data["id"],
                }
    def create_server_track(self, track_data: Dict) -> bool:
        """Update a single track on the server"""
        try:
            response = requests.post(
                f"{self.server_url}/tracks",
                headers=self.headers,
                json={**self.get_server_version(track_data),"id":track_data["id"]}
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self.logger.error(
                f"Failed to update track {track_data.get('id', 'unknown')}: {e}")
            return False
    def update_server_track(self, track_data: Dict) -> bool:
        """Update a single track on the server"""
        print(self.get_server_version(track_data))
        try:
            response = requests.put(
                f"{self.server_url}/tracks/{track_data['id']}",
                headers=self.headers,
                json={**self.get_server_version(track_data),"id":track_data["id"]}
            )
            response.raise_for_status()
            return True
        except requests.RequestException as e:
            self.logger.error(
                f"Failed to update track {track_data.get('id', 'unknown')}: {e}")
            return False

def setup_logging(verbose: bool):
    """Configure logging based on verbosity level"""
    log_level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )


def validate_url(url: str) -> str:
    """Validate URL format"""
    if not url.startswith(('http://', 'https://')):
        raise argparse.ArgumentTypeError(
            'Server URL must start with http:// or https://'
        )
    return url


def validate_file(file_path: str) -> str:
    """Validate that the file exists and is JSON"""
    path = Path(file_path)
    if not path.exists():
        raise argparse.ArgumentTypeError(f'File not found: {file_path}')
    if path.suffix.lower() != '.json' and path.suffix.lower() != ".jsonl":
        raise argparse.ArgumentTypeError(
            f'File must be a JSON file: {file_path}')
    return file_path


def get_token_from_env() -> Optional[str]:
    """Get JWT token from environment variable"""
    import os
    return os.getenv('JWT_TOKEN')


def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description='Synchronize track information between local JSON and server',
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )

    parser.add_argument(
        '-s', '--server',
        type=validate_url,
        required=True,
        help='Server URL (e.g., http://your-server.com)'
    )

    parser.add_argument(
        '-f', '--file',
        type=validate_file,
        required=True,
        help='Path to local JSON file containing track information'
    )

    parser.add_argument(
        '-t', '--token',
        help='JWT token for authentication (can also be set via JWT_TOKEN environment variable)'
    )

    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be updated without making changes'
    )

    return parser.parse_args()

from typing import Dict, List, Set

def is_out_of_date(server_tracks: List[Dict], local_track: Dict) -> bool:
    """
    Determine if a local track needs to be updated on the server.
    
    Args:
        server_tracks: List of track dictionaries from the server
        local_track: Single track dictionary from local JSON
        
    Returns:
        bool: True if track needs updating, False if it's up to date
    """
    # Find matching track on server by ID
    server_track = next(
        (track for track in server_tracks if str(track['id']) == str(local_track['id'])), 
        None
    )

    # If track doesn't exist on server, it needs updating
    if not server_track:
        return True
    if local_track["artist"]["name"] != server_track["artist"]:
        return True
    if local_track["album"]["cover_medium"] != server_track["cover"]:
        return True
    if local_track["link"] != server_track["trackSource"]["url"]:
        return True
    
    return False

# Example usage in your main sync logic:
def find_tracks_to_update(local_tracks: List[Dict], server_tracks: List[Dict]) -> List[Dict]:
    """Find all tracks that need to be updated on the server"""
    return [
        track for track in local_tracks
        if is_out_of_date(server_tracks, track)
    ]

def main():
    """Main entry point for the CLI"""
    args = parse_arguments()
    setup_logging(args.verbose)
    logger = logging.getLogger(__name__)

    # Get JWT token from command line or environment
    jwt_token = args.token or get_token_from_env()
    if not jwt_token:
        logger.error(
            "JWT token must be provided either via --token argument or JWT_TOKEN environment variable")
        return 1

    try:
        synchronizer = TrackSynchronizer(args.server, args.file, jwt_token)

        # Load local tracks
        local_tracks = synchronizer.load_local_tracks()
        if not local_tracks:
            logger.error("No local tracks found")
            return 1

        # Get server tracks
        server_tracks = synchronizer.get_server_tracks()
        if server_tracks is None:
            logger.error(
                "Failed to fetch server tracks. Check your JWT token and server URL.")
            return 1

        server_track_ids = {int(track['id']) for track in server_tracks}
        # Find tracks that need to be updated
        tracks_to_create = [track for track in local_tracks if track["id"] not in server_track_ids]
        tracks_to_update = find_tracks_to_update(local_tracks,server_tracks)
        if not tracks_to_update:
            logger.info("No tracks need updating")
            return 0

        logger.info(f"Found {len(tracks_to_update)} tracks to update")

        if args.dry_run:
            logger.info("Dry run - would update the following tracks:")
            for track in tracks_to_update:
                logger.info(
                    f"  - {track.get('id')}: {track.get('title', 'Unknown Title')}")
            logger.info(f"Total {len(tracks_to_update)} tracks updated {len(server_track_ids)} on the server")
            return 0

        # Update tracks
        
        success_count = 0
        with tqdm(tracks_to_create, desc="Creating tracks") as pbar:
            for track in pbar:
                if synchronizer.create_server_track(track):
                    success_count += 1
                    pbar.set_postfix({'last_id': str(track.get('id'))})
        with tqdm(tracks_to_update, desc="Updating tracks") as pbar:
            for track in pbar:
                if synchronizer.update_server_track(track):
                    success_count += 1
                    pbar.set_postfix({'last_id': str(track.get('id'))})
                
                
        logger.info(
            f"Sync complete. Updated {success_count}/{len(tracks_to_update)} tracks")
        return 0 if success_count == len(tracks_to_update) else 1

    except Exception as e:
        logger.error(f"An error occurred: {e}", exc_info=args.verbose)
        return 1


if __name__ == "__main__":
    exit(main())
