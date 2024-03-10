const windowWidth = 7;
const windowHeight = 10;

const pieces = [
	{name: 'o', x: 2, y: -2, pixels: [[1, 2, 0, 0], [3, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]},
	{name: 'i', x: 3, y: -4, pixels: [[1, 0, 0, 0], [2, 0, 0, 0], [3, 0, 0, 0], [4, 0, 0, 0]]},
	{name: 't', x: 2, y: -2, pixels: [[1, 2, 3, 0], [0, 4, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]},
];
var currentPiece = null;
var blockTags = null;
var placedBlockNames = null;

function setBlock(x, y, imageName) {
	if (!blockTags[y][x]) {
		var img = document.createElement('img');
		img.style.position = 'absolute';
		img.style.left = (x * 100) + 'px';
		img.style.top = (y * 100) + 'px';
		document.getElementById('blocks').appendChild(img);
		blockTags[y][x] = img;
	}
	blockTags[y][x].src = 'images/' + imageName + '.png';
}

function getCurrentBlockName(x, y) {
	if (currentPiece) {
		var localX = x - currentPiece.x;
		var localY = y - currentPiece.y;
		if (localX >= 0 && localX < 4 && localY >= 0 && localY < 4 && currentPiece.pixels[localY][localX])
			return currentPiece.name + '_' + currentPiece.pixels[localY][localX];
	}
	return placedBlockNames[y][x];
}

function clearLine(lineY) {
	for (var y = lineY; y > 0; --y)
		for (var x = 0; x < windowWidth; ++x)
			placedBlockNames[y][x] = placedBlockNames[y - 1][x];
	for (var x = 0; x < windowWidth; ++x)
		placedBlockNames[0][x] = 'empty';
}

function clearFullLines() {
	for (var y = 0; y < windowHeight; ++y)
		if (placedBlockNames[y].every((name) => name != 'empty'))
			clearLine(y);
}

function insertCurrentPiece() {
	for (var y = 0; y < windowHeight; ++y)
		for (var x = 0; x < windowWidth; ++x)
			placedBlockNames[y][x] = getCurrentBlockName(x, y);
	currentPiece = null;

	clearFullLines();
}

function updateBlocks() {
	for (var y = 0; y < windowHeight; ++y)
		for (var x = 0; x < windowWidth; ++x)
			setBlock(x, y, getCurrentBlockName(x, y));
}

function getPieceWidth() {
	for (var x = 3; x >= 0; --x)
		for (var y = 0; y < 4; ++y)
			if (currentPiece.pixels[y][x])
				return x + 1;
}

function getPieceHeight() {
	for (var y = 3; y >= 0; --y)
		for (var x = 0; x < 4; ++x)
			if (currentPiece.pixels[y][x])
				return y + 1;
}

function getPieceMinX() {
	return currentPiece.x;
}

function getPieceMaxX() {
	return currentPiece.x + getPieceWidth() - 1;
}

function getPieceMinY() {
	return currentPiece.y;
}

function getPieceMaxY() {
	return currentPiece.y + getPieceHeight() - 1;
}

function isValidPosition() {
	var p = currentPiece;
	if (getPieceMinX() < 0 || getPieceMaxX() >= windowWidth || getPieceMaxY() >= windowHeight)
		return false;
	for (var localY = 0; localY < 4; ++localY) {
		for (var localX = 0; localX < 4; ++localX) {
			if (p.pixels[localY][localX]) {
				if (localY + p.y >= windowHeight)
					return false;
				if (localY + p.y >= 0 && placedBlockNames[localY + p.y][localX + p.x] != 'empty')
					return false;
			}
		}
	}
	return true;
}

function restart() {
	document.getElementById('blocks').innerHTML = '';
	blockTags = [];
	placedBlockNames = [];
	for (var y = 0; y < windowHeight; ++y) {
		blockTags[y] = [];
		placedBlockNames[y] = [];
		for (var x = 0; x < windowWidth; ++x)
			placedBlockNames[y][x] = 'empty';
	}
	updateBlocks();
}

function mainLoop() {
	if (!currentPiece) {
        currentPiece = Object.assign({}, pieces[Math.floor(Math.random() * pieces.length)]);
	} else {
		currentPiece.y += 1;
		if (!isValidPosition()) {
			currentPiece.y -= 1;
			if (getPieceMinY() < 0)
				restart();
			else
				insertCurrentPiece();
		}
	}
	updateBlocks();
}

function handleKeyPress(event) {
	if (currentPiece) {
		if (event.key === 'a') {
			currentPiece.x -= 1;
			if (isValidPosition())
				updateBlocks();
			else
				currentPiece.x += 1;
		} else if (event.key === 'd') {
			currentPiece.x += 1;
			if (isValidPosition())
				updateBlocks();
			else
				currentPiece.x -= 1;
		}
	}
}

document.addEventListener('DOMContentLoaded', function () {
	restart();
	setInterval(mainLoop, 1000);
	document.addEventListener('keydown', handleKeyPress);
});
