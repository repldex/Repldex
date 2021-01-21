function checkLazyImages() {
	for (const el of document.getElementsByClassName('lazy')) {
		const imageUrl = el.getAttribute('data-src')
		const imageAlt = el.alt
		
		el.style.height = '10em'
		el.style.filter = 'blur(10px)'
		const imageFullEl = document.createElement('img')
		imageFullEl.style.overflow = 'hidden'
		imageFullEl.style.width = '0'
		imageFullEl.src = imageUrl
		imageFullEl.alt = imageAlt
		imageFullEl.addEventListener('load', () => {
			for (const className of el.classList)
				if (className != 'lazy')
					imageFullEl.classList.add(className)
			el.parentNode.insertBefore(imageFullEl, el.nextSibling)
			el.remove()
			imageFullEl.style.removeProperty('overflow')
			imageFullEl.style.removeProperty('width')
		})
	}	
}
document.addEventListener('DOMContentLoaded', checkLazyImages)