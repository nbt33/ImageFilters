# video_io.py
import cv2
import numpy as np

def extract_significant_frames(video_path: str, threshold: float = 30.0) -> list[np.ndarray]:
    cap = cv2.VideoCapture(video_path)
    frames = []

    success, prev = cap.read()
    if not success:
        cap.release()
        return []

    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    frames.append(prev)

    while True:
        success, curr = cap.read()
        if not success:
            break

        curr_gray = cv2.cvtColor(curr, cv2.COLOR_BGR2GRAY)
        diff = cv2.absdiff(prev_gray, curr_gray)
        score = np.mean(diff)

        if score > threshold:
            frames.append(curr)
            prev_gray = curr_gray

    cap.release()
    return frames
