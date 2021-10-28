const gap = 16;

const carousel = document.getElementById("carousel"),
      content = document.getElementById("content"),
      next = document.getElementById("next"),
      prev = document.getElementById("prev");

next.addEventListener("click", e => {
  carousel.scrollBy(width + gap, 0);
  if (carousel.scrollWidth !== 0) {
    prev.style.display = "flex";
  }
  if (content.scrollWidth - width - gap <= carousel.scrollLeft + width) {
    next.style.display = "none";
  }
});
prev.addEventListener("click", e => {
  carousel.scrollBy(-(width + gap), 0);
  if (carousel.scrollLeft - width - gap <= 0) {
    prev.style.display = "none";
  }
  if (!content.scrollWidth - width - gap <= carousel.scrollLeft + width) {
    next.style.display = "flex";
  }
});

let width = carousel.offsetWidth;
window.addEventListener("resize", e => (width = carousel.offsetWidth));


const carouselMinted = document.getElementById("carouselMinted"),
      contentMinted = document.getElementById("contentMinted"),
      nextMinted = document.getElementById("nextMinted"),
      prevMinted = document.getElementById("prevMinted");

nextMinted.addEventListener("click", e => {
  carouselMinted.scrollBy(widthMinted + gap, 0);
  if (carouselMinted.scrollWidth !== 0) {
    prevMinted.style.display = "flex";
  }
  if (contentMinted.scrollWidth - widthMinted - gap <= carouselMinted.scrollLeft + widthMinted) {
    nextMinted.style.display = "none";
  }
});
prevMinted.addEventListener("click", e => {
  carouselMinted.scrollBy(-(widthMinted + gap), 0);
  if (carouselMinted.scrollLeft - widthMinted - gap <= 0) {
    prevMinted.style.display = "none";
  }
  if (!contentMinted.scrollWidth - widthMinted - gap <= carouselMinted.scrollLeft + widthMinted) {
    nextMinted.style.display = "flex";
  }
});

let widthMinted = carouselMinted.offsetWidth;
window.addEventListener("resize", e => (widthMinted = carouselMinted.offsetWidth));

$(document).ready(function() {
  checkScrollButtons();
});

function checkScrollButtons() {
  if (carouselMinted.scrollLeft - widthMinted - gap <= 0) {
    prevMinted.style.display = "none";
  } else if (carouselMinted.scrollWidth !== 0) {
    prevMinted.style.display = "flex";
  }
  if (contentMinted.scrollWidth - widthMinted - gap <= carouselMinted.scrollLeft + widthMinted) {
    nextMinted.style.display = "none";
  }
  else{
    nextMinted.style.display = "flex";
  } 
  if(nextMinted.style.display === "none" && prevMinted.style.display === "none")
  {
    if (carouselMinted.scrollWidth !== 0 && !contentMinted.scrollWidth - widthMinted - gap <= carouselMinted.scrollLeft + widthMinted) {
      if(carouselMinted.scrollLeft!==0){
      nextMinted.style.display = "flex";
      prevMinted.style.display = "flex";
      }
    }
  }  
}

$(".galleryImage").on("click", function(e){
  $("#myModal").css('display','block');

});

$(".closeModal").on("click", function(e){
  $("#myModal").css('display','none');
});

$(window).on("click", function(e){
  if (e.target == document.getElementById("myModal")) {
    document.getElementById("myModal").style.display = "none";
  }
});
