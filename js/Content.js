import gsap from "gsap"


class Content {
    constructor({ goToSection, camera, mobile }) {
        this.masterContainer = document.querySelector(".container")
        this.sections = document.querySelectorAll(".content > div")
        this.projectContainers = document.querySelectorAll(".second > div")
        this.navBtns = document.querySelectorAll('.nav-cont > div')
        this.mobile = mobile
        this.camera = camera
        this.currentSection = 0
        this.addEventListeners()
        this.goToSectionAnime = goToSection
        this.contentAnimations()
        this.animateNav(0)
    }

    removeProject() {
        // this.hideAll('projects')
    }

    showProject(num, dir) {
        console.log(num, dir)
        this.hideAll('projects')
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

    moveToSection(to) {
        console.log(to)
        this.sections[this.currentSection].classList.add('hide-section')
        this.sections[to].classList.remove('hide-section')
        this.goToSectionAnime(to)
        this.currentSection = to
    }

    contentAnimations() {
        document.querySelectorAll('.line-anime').forEach((el, i) => {
            el.addEventListener('mouseenter', () => {
                // if (this.nextAnime) {
                //     this.nextAnime.kill()
                // }
                this.nextAnime = new gsap.timeline({ paused: true })

                this.nextAnime.fromTo(el.querySelector('.line'),
                    {
                        xPercent: 0
                    },
                    {
                        xPercent: 100,
                        duration: 0.5
                    },
                )
                this.nextAnime.fromTo(el.querySelector('.line'),
                    {
                        xPercent: -100
                    },
                    {
                        xPercent: 0,
                        duration: 0.5
                    },
                )
                this.nextAnime.play(0)
            })
            el.addEventListener('mouseleave', () => {
                // if (this.nextAnime) {
                //     this.nextAnime.kill()
                // }
                this.nextAnime = new gsap.timeline({ paused: true })
                this.nextAnime.to(el.querySelector('.line'),
                    {
                        xPercent: 0,
                        duration: 0.6
                    },
                )
                this.nextAnime.play(0)
            })
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
                    gridTemplateColumns: this.mobile ? "50% 25% 25%" : "80% 10% 10%",
                    
                },
            )
        }
        else if (i == 1) {
            this.animateNavAnime.to('.nav-cont',
                {
                    gridTemplateColumns: this.mobile ? "25% 50% 25%" : "10% 80% 10%"
                }
            )
        }
        else if (i == 2) {
            this.animateNavAnime.to('.nav-cont',
                {
                    gridTemplateColumns: this.mobile ? "25% 25% 50%" : "10% 10% 80%"
                }
            )
        }
        this.animateNavAnime.play(0)
    }


    addEventListeners() {
        this.nextBtns = document.querySelectorAll('.next')
        this.nextBtns.forEach((el, i) => {
            el.addEventListener('click', () => {
                this.moveToSection(i + 1)
                this.navBtns.forEach(ela => ela.classList.remove('active'))
                this.animateNav(i + 1)
            })
        })
        document.querySelector('.third > .check').addEventListener('click', () => {
            console.log(this.camera.position, this.camera.rotation)
        })

        this.navBtns.forEach((el, i) => {
            el.addEventListener('click', () => {
                this.navBtns.forEach(ela => ela.classList.remove('active'))
                this.animateNav(i)
                this.moveToSection(i)
            })
        })
    }

}

export { Content }