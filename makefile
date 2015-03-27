all:
	uglifyjs ./src/core.js ./src/utils.js ./src/tooltip.js ./src/line.js ./src/bar.js ./src/bar2D.js ./src/bubble.js -b -o moby-0.1.0.js
	uglifyjs ./src/core.js ./src/utils.js ./src/tooltip.js ./src/line.js ./src/bar.js ./src/bar2D.js ./src/bubble.js -o moby-0.1.0.min.js -c -m