const cards = document.querySelectorAll(".card")

const toggleExpansion = (element, to, duration = 350) => {
  return new Promise((res) => {
    element.animate(
      [
        {
          top: to.top,
          left: to.left,
          width: to.width,
          height: to.height
        }
      ],
      { duration, fill: "forwards", ease: "ease-in" }
    )
    setTimeout(res, duration)
  })
}

const fadeContent = (element, opacity, duration = 300) => {
  return new Promise((res) => {
    ;[...element.children].forEach((child) => {
      requestAnimationFrame(() => {
        child.style.transition = `opacity ${duration}ms linear`
        child.style.opacity = opacity
      })
    })
    setTimeout(res, duration)
  })
}


const getCardContent = async () => {
  try {
    const response = await fetch('content.json'); 
    const data = await response.json();

    const paragraphs = data.paragraphs.map(paragraph => `<p>${paragraph}</p>`).join('');

    return `
      <div class="card-content">
        <h2>${data.title}</h2>
        <img src="${data.img}" alt="${data.title}">
        <!-- <img src="images/${data.img}.png" alt="${data.title}"> -->
        ${paragraphs}
      </div>
    `;
  } catch (error) {
    console.error('Error fetching content:', error);
    return ''; // Return an empty string or a default content in case of an error
  }
};



const createCloseButton = () => {
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&#10005";
  closeButton.style = `
    position: fixed;
    z-index: 10000;
    top: 35px;
    right: 45px;
    width: 35px;
    height: 35px;
    opacity: 0.1;
    border: 0;
    background: transparent;
    color: white;
    font-size: 2rem;
  `;
  return closeButton;
};



const cloneAndPositionCard = (card, top, left, width, height) => {
  const cardClone = card.cloneNode(true);
  cardClone.style.position = "fixed";
  cardClone.style.top = top + "px";
  cardClone.style.left = left + "px";
  cardClone.style.width = width + "px";
  cardClone.style.height = height + "px";
  return cardClone;
};

const resetCardStyles = (cardClone) => {
  cardClone.style.removeProperty("display");
  cardClone.style.removeProperty("padding");
  [...cardClone.children].forEach((child) => {
    child.style.removeProperty("display");
  });
};

const onCardClick = async (e) => {
  const card = e.currentTarget;
  const { top, left, width, height } = card.getBoundingClientRect();
  const cardClone = cloneAndPositionCard(card, top, left, width, height);

  card.style.opacity = "0";
  card.parentNode.appendChild(cardClone);

  const closeButton = createCloseButton();
  
  const closeCard = async () => {
    document.removeEventListener("keydown", handleEscKeyPress);
    closeButton.remove();
    resetCardStyles(cardClone);
    fadeContent(cardClone, "0");
    await toggleExpansion(cardClone, { top: `${top}px`, left: `${left}px`, width: `${width}px`, height: `${height}px` }, 300);
    card.style.removeProperty("opacity");
    cardClone.remove();
  };

  const handleEscKeyPress = (event) => {
    if (event.key === "Escape") {
      closeCard();
    }
  };

  document.addEventListener("keydown", handleEscKeyPress);

  closeButton.addEventListener("click", () => {
    closeCard();
  });

  fadeContent(cardClone, "0").then(() => {
    [...cardClone.children].forEach((child) => {
      child.style.display = "none";
    });
  });

  await toggleExpansion(cardClone, { top: 0, left: 0, width: "100vw", height: "100vh" });

  const content = await getCardContent(card.textContent);
  cardClone.style.display = "block";
  cardClone.style.padding = "0";
  cardClone.appendChild(closeButton);
  cardClone.insertAdjacentHTML("afterbegin", content);
};

cards.forEach((card) => card.addEventListener("click", onCardClick));


