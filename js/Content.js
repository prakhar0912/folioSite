import favOn from '../img/fav-on.png'
import favOff from '../img/fav-off.png'

import gsap from "gsap"



class Content {
    constructor({ goToSection, camera, mobile }) {
        this.masterContainer = document.querySelector(".container")
        this.sections = document.querySelectorAll(".content > div")
        this.projectContainers = document.querySelectorAll(".second > .proj")
        this.navBtns = document.querySelectorAll('.nav-cont > div')
        this.socialsBtns = document.querySelectorAll('.socials > div')
        this.mobile = mobile
        this.camera = camera
        this.hintContainer = this.mobile ? document.querySelector('.hint-mobile > p') : document.querySelector('.hint')
        this.mainPercent = 80
        if (this.mobile) {
            this.mainPercent = 50
        }
        this.currentSection = 0
        this.preLoader = document.querySelector('.preloader')
        this.loaderLen = document.querySelector('.loader')
        this.loaderNum = document.querySelector('.loader > p')
        this.loaded = 0
        this.resizeFunc()
        this.addEventListeners()
        this.goToSectionAnime = goToSection
        this.contentAnimations()
        this.animateNav(0)
        this.on = true
        this.titleAnimate()
    }

    titleAnimate() {
        setInterval(() => {
            var link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = this.on ? favOn : favOff;
            this.on = !this.on
        }, 1000)
    }

    loadedModel(i, j) {
        if (this.loaderAnime) {
            this.loaderAnime.kill()
        }
        this.loaderAnime = gsap.to(this.loaderLen,
            {
                width: `${(this.loaded / 19) * (this.mobile ? 90 : 97)}vw`,
                onComplete: () => {
                    if (this.loaded >= 19) {
                        this.removeLoader()
                    }
                }
            }
        )
        this.loaderNum.innerHTML = Math.round(this.loaded * 100 / 19)
        this.loaded++
    }

    removeLoader() {
        gsap.to('.pretext',
            {
                opacity: 0,
                duration: 0.2,
                ease: "Power4.in"
            }
        )
        gsap.to(this.loaderLen,
            {
                opacity: 0,
                duration: 0.2,
                ease: "Power4.in"
            }
        )
        gsap.to(this.preLoader,
            {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    this.preLoader.style.display = 'none'
                },
                ease: "Power4.in"
            }
        )
        this.loadedAnimations()
    }

    loadedAnimations() {
        document.querySelectorAll('.first > div > .idk > div > h2').forEach((el, i) => {
            gsap.fromTo(el,
                {
                    yPercent: 100
                },
                {
                    yPercent: 0,
                    delay: (i) * 0.05
                }
            )
        })
        this.lineAnimeStart(document.querySelector('.first > div > .line-anime'), 'f')
    }

    removeProject() {
        // this.hideAll('projects')
    }

    showProject(num, dir) {
        console.log(num, dir)
        this.hideAll('projects')
        this.animateSection(num, dir)
        this.projectContainers[num].classList.remove('hide-project')
    }


    hideAll(type) {
        if (type == 'sections') {
            for (let i = 0; i < this.sections.length; i++) {
                this.sections[i].classList.add('hide-section')
            }
        }
        else if (type == 'projects') {
            for (let i = 0; i < this.projectContainers.length; i++) {
                this.projectContainers[i].classList.add('hide-project')
            }
        }

    }

    animateSection(sec, dir) {
        this.projectContainers[sec].querySelectorAll('.idk > div > h2').forEach((el, i) => {
            gsap.fromTo(el,
                {
                    yPercent: dir == 'f' ? 100 : -100
                },
                {
                    yPercent: 0,
                    delay: (i) * 0.05
                }
            )
        })
        this.lineAnimeStart(this.projectContainers[sec].querySelector('.line-anime'), dir)

    }

    moveToSection(to) {
        let option = true
        if (option) {
            this.sections[this.currentSection].classList.add('hide-section')
            this.goToSectionAnime(to)
            this.currentSection = to
            if (this.currentSection != 1) {
                this.hideHint()
            }
        }
        else {
            gsap.to(this.sections[this.currentSection], {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    this.sections[this.currentSection].classList.add('hide-section')
                    this.goToSectionAnime(to)
                    this.currentSection = to
                    if (this.currentSection != 1) {
                        this.hideHint()
                    }
                }
            })
        }
    }

    showSection(sec) {
        if (!this.mobile) {
            gsap.fromTo(this.sections[sec],
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                }
            )
        }
        this.sections[sec].classList.remove('hide-section')
        if (this.currentSection == 1) {
            this.showHint()
        }
    }

    showHint() {
        gsap.to(this.hintContainer,
            {
                opacity: 1
            }
        )
        if (this.blowAnime) {
            this.blowAnime.kill()
        }
        this.blowAnime = gsap.timeline({ repeat: 8 })
        this.blowAnime.to(this.hintContainer,
            {
                scale: 1.3,
                duration: 1
            }
        )
        this.blowAnime.to(this.hintContainer,
            {
                scale: 1,
                duration: 1
            }
        )
    }

    hideHint() {
        if (this.blowAnime) {
            this.blowAnime.kill()
        }
        gsap.to(this.hintContainer,
            {
                scale: 1,
                opacity: 0
            }
        )
    }

    lineAnimeStart(el, dir = 'b') {

        this.nextAnime = new gsap.timeline({ paused: true })

        this.nextAnime.fromTo(el.querySelector('.line'),
            {
                xPercent: 0
            },
            {
                xPercent: dir == 'b' ? -100 : 100,
                duration: 0.5
            },
        )
        this.nextAnime.fromTo(el.querySelector('.line'),
            {
                xPercent: dir == 'b' ? 100 : -100
            },
            {
                xPercent: 0,
                duration: 0.5
            },
        )
        this.nextAnime.play(0)
    }

    lineAnimeEnd(el) {
        this.nextAnime = new gsap.timeline({ paused: true })
        this.nextAnime.to(el.querySelector('.line'),
            {
                xPercent: 0,
                duration: 0.6
            },
        )
        this.nextAnime.play(0)
    }

    contentAnimations() {
        document.querySelectorAll('.line-anime').forEach((el, i) => {
            el.addEventListener('mouseenter', () => {
                if (this.nextAnime && this.nextAnime.isActive()) {
                    this.nextAnime.kill()
                    this.lineAnimeEnd(el)
                }
                else {
                    this.lineAnimeStart(el, 'f')
                }
            })
            // el.addEventListener('mouseleave', () => {
            //     // if (this.nextAnime) {
            //     //     this.nextAnime.kill()
            //     // }
            //     this.lineAnimeEnd(el)
            // })
        })


    }

    animateNav(i) {
        this.animateNavAnime = gsap.timeline({
            paused: true,
            onComplete: () => {
                this.navBtns[i].classList.add('active')
            }
        })
        if (i == 0) {
            this.animateNavAnime.to('.nav-cont',
                {
                    gridTemplateColumns: `${this.mainPercent}% ${(100 - this.mainPercent) / 2}% ${(100 - this.mainPercent) / 2}%`,
                },
            )
        }
        else if (i == 1) {
            this.animateNavAnime.to('.nav-cont',
                {
                    gridTemplateColumns: `${(100 - this.mainPercent) / 2}% ${this.mainPercent}% ${(100 - this.mainPercent) / 2}%`
                }
            )
        }
        else if (i == 2) {
            this.animateNavAnime.to('.nav-cont',
                {
                    gridTemplateColumns: `${(100 - this.mainPercent) / 2}% ${(100 - this.mainPercent) / 2}% ${this.mainPercent}%`
                }
            )
        }
        this.animateNavAnime.play(0)
    }

    resizeFunc() {
        if (this.mobile) {
            if (this.mainPercent != 50 && window.innerWidth > 416) {
                this.mainPercent = 50
                this.animateNav(this.currentSection)
            }
            if (window.innerWidth <= 416 && this.mainPercent != 45) {
                this.mainPercent = 40
                this.animateNav(this.currentSection)
            }
        }
        else {
            if (window.innerWidth < 1450 && this.mainPercent != 70) {
                this.mainPercent = 70
                this.animateNav(this.currentSection)
            }
            if (window.innerWidth < 990 && this.mainPercent != 65) {
                this.mainPercent = 65
                this.animateNav(this.currentSection)
            }
            if (window.innerWidth < 900 && this.mainPercent != 50) {
                this.mainPercent = 50
                this.animateNav(this.currentSection)
            }
            if (window.innerWidth > 1450 && this.mainPercent != 80) {
                this.mainPercent = 80
                this.animateNav(this.currentSection)
            }
        }

    }

    socialOpen(btn) {
        gsap.to(btn.querySelector('div > p'), { width: "auto" })
    }

    socialClose(btn) {
        gsap.to(btn.querySelector('div > p'), { width: 0, delay: 0.5 })
    }

    navClick(i) {
        this.navBtns.forEach(ela => ela.classList.remove('active'))
        this.animateNav(i)
        this.moveToSection(i)
    }


    addEventListeners() {
        this.nextBtns = document.querySelectorAll('.next')
        this.nextBtns.forEach((el, i) => {
            el.addEventListener('click', () => {
                this.navClick(1)
            })
        })

        this.navBtns.forEach((el, i) => {
            el.addEventListener('click', () => {
                this.navClick(i)
            })
        })

        window.addEventListener('resize', this.resizeFunc.bind(this))


        if (!this.mobile) {
            this.socialsBtns.forEach(e => {
                e.addEventListener('mouseenter', () => {
                    this.socialOpen(e)
                })
                e.addEventListener('mouseleave', () => {
                    this.socialClose(e)
                })
            })
        }
    }

}

export { Content }