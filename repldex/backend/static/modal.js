window.addEventListener('DOMContentLoaded', function(e) {
    let image = document.getElementById('open-fullview');
    let close = document.getElementById('exit-fullview');
    let viewBG = document.getElementsByClassName("modal-background")[0];

    image.addEventListener('click', function(e) {
        e.preventDefault();

        var modal = document.getElementById("fullview");
        var html = document.getElementsByTagName("html")[0];

        modal.classList.add("is-active");
        html.classList.add("is-clipped");
    });

    close.addEventListener('click', function(e) {
        e.preventDefault();

        var modal = document.getElementById("fullview");
        var html = document.getElementsByTagName("html")[0];

        modal.classList.remove("is-active");
        html.classList.remove("is-clipped");
    });

    viewBG.addEventListener('click', function(e) {
        e.preventDefault();

        var modal = document.getElementById("fullview");
        var html = document.getElementsByTagName("html")[0];

        modal.classList.remove("is-active");
        html.classList.remove("is-clipped");
    });
});