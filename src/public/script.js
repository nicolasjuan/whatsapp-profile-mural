const socket = io();

const gallery = document.getElementById("gallery");

socket.on("newImage", (img) => {
    console.log("New image");
    appendImage(img);
});

socket.on("loadImages", (imageList) => {
    console.log(imageList);
    imageList.forEach(img => appendImage(img.pic));
});

function adjustGrid() {
    const numberOfPhotos = gallery.children.length;

    // Calcular y establecer el ancho de cada foto
    const photos = document.querySelectorAll(".photo");
    const photoWidth = tamañoImagen(numberOfPhotos);
    photos.forEach(photo => {
        photo.style.width = `${photoWidth}px`;
        photo.style.height = `${photoWidth}px`;
    });

    window.scrollTo(0, 0);
};

function tamañoImagen(n) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    return Math.sqrt((vw * vh) / n) - 5
}

const appendImage = (img) => {
    gallery.innerHTML += `<img class="photo animate__animated animate__zoomIn" src="${img}">`;
    adjustGrid();
}

window.onload = function() {
    adjustGrid();
};

window.onresize = function() {
    adjustGrid();
};