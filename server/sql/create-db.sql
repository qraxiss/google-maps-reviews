CREATE DATABASE IF NOT EXISTS `google-maps-reviews`;

CREATE USER IF NOT EXISTS 'admin'@'%' IDENTIFIED BY 'admin123';
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY 'admin123';

GRANT ALL PRIVILEGES ON `google-maps-reviews`.* TO 'admin'@'%';
GRANT ALL PRIVILEGES ON `google-maps-reviews`.* TO 'admin'@'localhost';

FLUSH PRIVILEGES;
