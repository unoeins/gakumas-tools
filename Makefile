build:
	docker build -t gakumas-tools . --build-arg BUILDKIT_INLINE_CACHE=1

start:
	docker run -p 80:3000 gakumas-tools
