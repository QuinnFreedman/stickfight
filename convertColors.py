from PIL import Image

paths = [
	'./red/explosion1.png',
	'./red/explosion2.png',
	'./red/explosion3.png',
	'./red/explosion4.png',
	'./red/fireball1.png',
	'./red/fireball1-.png',
	'./red/fireball2.png',
	'./red/fireball2-.png',
	'./red/fireball3.png',
	'./red/fireball3-.png'
	]

def h(hex):
	return tuple(int(hex[i:i+2], 16) for i in (0, 2 ,4))

old = [
	h('002ec4'),
	h('002eff'),
	h('0077ff'),
	h('5bb2ff'),
	h('b5dcff')
]

new = [
	h('b50000'),
	h('ff0000'),
	h('ff5e00'),
	h('ffd839'),
	h('fff8d6')
]

for path in paths:
	image = Image.open(path)
	pixels = image.load()

	width, height = image.size
	for x in range(width):
	    for y in range(height):
	        r, g, b, a = pixels[x, y]
	        for i in range(5):
	        	if (r, g, b) == old[i]:
	        		pixels[x, y] = (new[i][0], new[i][1], new[i][2], a)

	image.save(path)