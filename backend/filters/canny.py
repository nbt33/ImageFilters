import cv2

def apply_canny(img):
    # Пороговые значения можно настроить, пока пусть так:
    edges = cv2.Canny(img, 100, 200)
    # Преобразуем в BGR, чтобы сохранить 3 канала
    return cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)