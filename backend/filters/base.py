# base.py
def apply_filter(img, filter_type: str):
    """
    Диспетчер фильтров.
    """
    if filter_type == "none":
        return img  # без изменений
    elif filter_type == "canny":
        from filters.canny import apply_canny
        return apply_canny(img)
    elif filter_type == "kmeans":
        from filters.kmeans import apply_kmeans
        return apply_kmeans(img)
    elif filter_type == "stylize":
        from filters.stylize import apply_stylize
        return apply_stylize(img)
    elif filter_type == "voronoi":
        from filters.voronoi import apply_voronoi
        return apply_voronoi(img)
    elif filter_type == "voronoi_colored":
        from filters.voronoi_colored import apply_voronoi_colored
        return apply_voronoi_colored(img)
    elif filter_type == "adaptive_enhancement":
        from filters.adaptive_enhancement import apply_adaptive_enhancement
        return apply_adaptive_enhancement(img)
    elif filter_type == "neural_flow":  # НОВЫЙ ФИЛЬТР
        from filters.neural_flow import apply_neural_flow
        return apply_neural_flow(img)
    elif filter_type == "quantum_ripple":  # НОВЫЙ ФИЛЬТР
        from filters.quantum_ripple import apply_quantum_ripple
        return apply_quantum_ripple(img)
    elif filter_type == "crystal_fractal":  # НОВЫЙ ФИЛЬТР
        from filters.crystal_fractal import apply_crystal_fractal
        return apply_crystal_fractal(img)
    elif filter_type == "neon_dreams":
        from filters.neon_dreams import apply_neon_dreams
        return apply_neon_dreams(img)
    else:
        raise ValueError(f"Неизвестный фильтр: {filter_type}")