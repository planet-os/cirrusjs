all:
	uglifyjs ./src/core.js ./src/utils.js ./src/data.js ./src/automatic.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -b -o dadavis.js
	uglifyjs ./src/core.js ./src/utils.js ./src/data.js ./src/automatic.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -o dadavis-min.js -c -m
