import cv2

def apply_stylize(img):
    # Параметры можно выставить другие (или подбирать динамически - на будущее)
    return cv2.stylization(img, sigma_s=60, sigma_r=0.07)
