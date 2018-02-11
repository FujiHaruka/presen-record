"""Generate cursor video from cursor.log ."""
import json
import cv2
import numpy as np
from sys import argv
from os.path import join

PROJ_DIR = argv[1]
SRC_VIDEO = argv[2]
DEST_VIDEO = argv[3]

VIDEO_W = 1280  # 720p
VIDEO_H = 720
FPS = 30
CURSOR_SIZE = 30

PROGRESS_FILE = join(PROJ_DIR, 'progress.log')
CURSOR_FILE = join(PROJ_DIR, 'cursor.log')
CURSOR_ICON_PATH = 'assets/cursor.png'


def get_times():
    with open(PROGRESS_FILE, 'r') as file:
        for line in file:
            event = json.loads(line)
            if event['event'] == 'start':
                start_at = event['at']
            if event['event'] == 'end':
                end_at = event['at']
    return (start_at, end_at)


def get_cursors():
    with open(CURSOR_FILE, 'r') as file:
        cursors = [json.loads(line) for line in file]
    return cursors


def inside_frame(position):
    x, y = position
    pad = CURSOR_SIZE
    return x > 5 and x < VIDEO_W - pad and y > 5 and y < VIDEO_H - pad


def calc_cursor_positions(cursors, start_at, end_at):
    cursors = cursors[:]
    frame_len = int(FPS * (end_at - start_at) / 1000)
    current_time = start_at
    current_pos = None
    current_cursor = cursors.pop(0)
    positions = []
    for _ in range(frame_len):
        positions.append(current_pos)
        current_time += 1000 / 30
        if current_time > current_cursor['at']:
            while True:
                if len(cursors) == 0:
                    break
                current_cursor = cursors.pop(0)
                if current_time < current_cursor['at']:
                    break
            current_pos = (
                int(current_cursor['x']) * 2,
                int(current_cursor['y']) * 2
            )
    return positions


def read_capture(src):
    capture = cv2.VideoCapture(src)
    if not capture.isOpened():
        print("Can not open video")
        exit(1)
    return capture


def create_masks(picture):
    gray = cv2.cvtColor(picture, cv2.COLOR_RGB2GRAY)
    ref, mask = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY)
    mask_inv = cv2.bitwise_not(mask)
    return (mask, mask_inv)


def apply_mask(frame, mask):
    return cv2.bitwise_and(frame, frame, mask=mask)


def overlay(frame, cursor_frame):
    mask, mask_inv = create_masks(cursor_frame)
    src1 = apply_mask(cursor_frame, mask)
    src2 = apply_mask(frame, mask_inv)
    dest = src1 + src2
    return dest


def print_progress(current, total):
    print("\r[frames] {0} / {1}".format(current, total), end="")


start_at, end_at = get_times()
cursors = get_cursors()
cursor_img = cv2.imread(CURSOR_ICON_PATH)
cursor_positions = calc_cursor_positions(cursors, start_at, end_at)

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(DEST_VIDEO, fourcc, FPS, (VIDEO_W, VIDEO_H))

capture = read_capture(SRC_VIDEO)

for i, position in enumerate(cursor_positions):
    has_next, frame = capture.read()
    if not has_next:
        break
    if position is not None and inside_frame(position):
        cursor_frame = np.zeros((VIDEO_H, VIDEO_W, 3), np.uint8)
        x, y = position
        cursor_frame[y:y+CURSOR_SIZE, x:x+CURSOR_SIZE] = cursor_img
        frame = overlay(frame, cursor_frame)
    writer.write(frame)
    print_progress(i, len(cursor_positions))

capture.release()
print()
