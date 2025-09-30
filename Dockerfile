# Étape 1 : récupérer l'image Nginx officielle
FROM nginx:alpine

# Copier les fichiers Angular buildés dans Nginx
COPY ./dist/amatun-home /usr/share/nginx/html

# Copier la config Nginx pour Angular (gestion du routing)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]