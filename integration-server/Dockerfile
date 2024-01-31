FROM oven/bun

WORKDIR /integration-server
COPY ./build .

EXPOSE 8000

ENTRYPOINT [ "bun", "run", "index.js" ]