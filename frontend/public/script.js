let mapa = document.getElementById('mapa')
let aux = 0

let mostraMapa = () => {
    mapa.style.display = 'inline-block'
}

let escondeMapa = () => {
    let checkMapa = document.getElementById('checkMapa')
    let selMapa = document.getElementById('selMapa')
    let ok = document.getElementById('ok')

    if (aux==1) {
        mapa.style.display = 'none'
        checkMapa.checked = true
        selMapa.style = 'border: 2px solid #014a8e'
        ok.style += 'display: inline; color: #014a8e; font-size: 13pt'
        aux = 0
    }
}

/* Captura de informação da imagem selecionada */
let imgs = document.getElementsByClassName('box-img')

for (let i=0; i<imgs.length; i++) {
    imgs[i].addEventListener('click', () => {
        aux = 1
        
        for (let i=0; i<imgs.length; i++) {
            imgs[i].style = 'background-color: none'
        }

        imgs[i].style = 'background-color: #dddddd'
    })
}