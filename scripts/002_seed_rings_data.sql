-- Seed initial ring data for Anillos Guillén catalog
INSERT INTO public.rings (code, name, description, metal_type, metal_karat, metal_color, diamond_points, diamond_clarity, diamond_color, price, image_url, featured, is_available) VALUES
('0122', 'Anillo de Compromiso Clásico', 'Elegante anillo de compromiso con diamante central y diseño atemporal', 'Oro', '14k', 'Blanco', 5.00, 'VS1', 'G', 18500.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', true, true),
('0234', 'Solitario Elegante', 'Diseño solitario con diamante de alta calidad montado en oro amarillo', 'Oro', '14k', 'Amarillo', 7.50, 'VVS2', 'F', 24500.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', true, true),
('0345', 'Anillo Halo Radiante', 'Diamante central rodeado de halo brillante en oro blanco', 'Oro', '18k', 'Blanco', 10.00, 'VS2', 'H', 32000.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', true, true),
('0456', 'Compromiso Moderno', 'Diseño contemporáneo con detalles en los costados', 'Oro', '14k', 'Blanco', 6.00, 'SI1', 'G', 19800.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', false, true),
('0567', 'Solitario Rosa Romántico', 'Delicado anillo en oro rosa con diamante brillante', 'Oro', '14k', 'Rosa', 5.50, 'VS1', 'F', 21200.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', false, true),
('0678', 'Triple Piedra Elegancia', 'Tres diamantes representando pasado, presente y futuro', 'Oro', '18k', 'Blanco', 15.00, 'VVS1', 'E', 45000.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', true, true),
('0789', 'Anillo Vintage', 'Inspirado en diseños art déco con detalles tallados', 'Oro', '14k', 'Amarillo', 8.00, 'VS2', 'G', 27500.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', false, true),
('0890', 'Compromiso Minimalista', 'Diseño limpio y moderno para estilo contemporáneo', 'Oro', '14k', 'Blanco', 4.00, 'SI1', 'H', 16500.00, '/elegant-diamond-engagement-ring-on-silk-fabric.jpg', false, true);
