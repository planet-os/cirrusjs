all:
	uglifyjs ./src/core.js ./src/utils.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/render.js -b -o dadavis-0.1.0.js
	uglifyjs ./src/core.js ./src/utils.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/render.js -o dadavis-0.1.0.min.js -c -m
