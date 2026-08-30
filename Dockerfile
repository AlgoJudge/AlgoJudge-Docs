# The documentation site, built and then served as files.
#
# **Two stages, and the second has no Node in it.** A static export needs a
# runtime to be produced and none to be served, so the published image is nginx
# and a directory.

FROM node:24-alpine AS build
WORKDIR /src

# The dependency layer, cached until the lockfile moves.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .

# `postinstall` was skipped above with `--ignore-scripts`, so the types
# fumadocs-mdx generates have to be made here, before the build reads them.
RUN npx fumadocs-mdx && npm run build

FROM nginx:1.29-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/redirects.conf /etc/nginx/redirects.conf
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=build /src/out /usr/share/nginx/html

# **Unprivileged, and therefore above 1024.** The base image drops to `nginx`
# for its workers only; this one never runs as root at all, which means it
# cannot bind 80.
#
# nginx creates its temporary directories at start-up, and as `nginx` it cannot:
# `/var/cache/nginx` and `/run` belong to root in the base image. Handing them
# over here rather than relying on a tmpfs mount is what lets `docker run` work
# on its own - an image that starts only under one particular compose file is a
# trap for whoever tries it without one.
RUN mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp         /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp         /var/cache/nginx/scgi_temp     && chown -R nginx:nginx /var/cache/nginx /var/log/nginx /run

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
