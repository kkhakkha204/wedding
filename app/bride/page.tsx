'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home, MapPinHouse } from 'lucide-react'
import Image from 'next/image'
import { useNavigationStore } from '@stores'
import { useRouter } from 'next/navigation'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GroomPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const section1Ref = useRef<HTMLDivElement>(null)
  const section2Ref = useRef<HTMLDivElement>(null)
  const section3Ref = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  const [currentSection, setCurrentSection] = useState(0)
  const [showQR, setShowQR] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [resourcesLoaded, setResourcesLoaded] = useState(false)

  // Resource loading tracking
  const [loadingStatus, setLoadingStatus] = useState({
    fonts: false,
    images: false,
    dom: false
  })

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Pre-hide all elements immediately
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Hide all main content immediately to prevent FOUC
    const elementsToHide = [
      containerRef.current,
      titleRef.current,
      section1Ref.current,
      section2Ref.current,
      section3Ref.current
    ]

    elementsToHide.forEach(element => {
      if (element) {
        gsap.set(element, { opacity: 0, visibility: 'hidden' })
      }
    })

    setIsReady(true)
  }, [])

  // Font loading checker
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkFonts = async () => {
      try {
        // Wait for all custom fonts to load
        await Promise.all([
          document.fonts.load('normal 1em TitleFont'),
          document.fonts.load('normal 1em NameFont'),
          document.fonts.load('normal 1em BodyFont'),
          document.fonts.load('normal 1em LineFont')
        ])
        
        setLoadingStatus(prev => ({ ...prev, fonts: true }))
      } catch {
        console.log('Font loading fallback after timeout')
        // Fallback after timeout
        setTimeout(() => {
          setLoadingStatus(prev => ({ ...prev, fonts: true }))
        }, 3000)
      }
    }

    // Start font loading check
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        checkFonts()
      })
    } else {
      // Fallback for browsers without font loading API
      setTimeout(() => {
        setLoadingStatus(prev => ({ ...prev, fonts: true }))
      }, 2000)
    }
  }, [])

  // Image preloading
  useEffect(() => {
    if (typeof window === 'undefined') return

    const imagesToLoad = [
      '/sontrangmain.jpg',
      '/sontrang1.png',
      '/sontrang2.png',
      '/sontrang4.png',
      '/namelogo.png',
      '/qrkha1.PNG'
    ]

    let loadedCount = 0
    const totalImages = imagesToLoad.length

    const updateImageProgress = () => {
      loadedCount++
      
      if (loadedCount === totalImages) {
        setLoadingStatus(prev => ({ ...prev, images: true }))
      }
    }

    // Preload all images
    imagesToLoad.forEach(src => {
      const img = new window.Image()
      img.onload = updateImageProgress
      img.onerror = updateImageProgress // Count failed loads too
      img.src = src
    })

    // Fallback timeout
    setTimeout(() => {
      setLoadingStatus(prev => ({ ...prev, images: true }))
    }, 10000) // 10 second fallback
  }, [])

  // DOM ready checker
  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkDOMReady = () => {
      if (document.readyState === 'complete') {
        setLoadingStatus(prev => ({ ...prev, dom: true }))
      } else {
        document.addEventListener('readystatechange', () => {
          if (document.readyState === 'complete') {
            setLoadingStatus(prev => ({ ...prev, dom: true }))
          }
        })
      }
    }

    checkDOMReady()
  }, [])

  // Check if all resources are loaded
  useEffect(() => {
    const allLoaded = Object.values(loadingStatus).every(status => status === true)
    if (allLoaded && !resourcesLoaded) {
      setResourcesLoaded(true)
    }
  }, [loadingStatus, resourcesLoaded])

  // Loading progress animation based on actual loading
  useEffect(() => {
    if (typeof window === 'undefined' || !isReady) return

    const loadedCount = Object.values(loadingStatus).filter(Boolean).length
    const totalResources = Object.keys(loadingStatus).length
    const targetProgress = (loadedCount / totalResources) * 100

    // Animate progress bar to current loading state
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${targetProgress}%`,
        duration: 0.5,
        ease: "power2.out"
      })
    }

    setLoadingProgress(targetProgress)

    // When all resources are loaded, complete the loading
    if (resourcesLoaded) {
      // Ensure progress reaches 100%
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          width: '100%',
          duration: 0.3,
          ease: "power2.out"
        })
      }

      // Start fade out animation after a brief delay
      setTimeout(() => {
        if (loadingRef.current) {
          gsap.to(loadingRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
              setIsLoading(false)

              // Show main content after loading completes
              if (containerRef.current) {
                gsap.set(containerRef.current, { visibility: 'visible' })
                gsap.to(containerRef.current, {
                  opacity: 1,
                  duration: 0.8,
                  ease: "power2.out"
                })
              }
            }
          })
        }
      }, 800) // Brief delay to show 100% completion
    }
  }, [loadingStatus, resourcesLoaded, isReady])

  // Initialize once loading is complete
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized || isLoading) return

    // Prevent default scrolling
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const sections = [section1Ref.current, section2Ref.current, section3Ref.current]

    // Initialize sections position - only show after loading
    sections.forEach((section, index) => {
      if (section) {
        gsap.set(section, { visibility: 'visible' })
        if (index === 0) {
          gsap.set(section, { opacity: 1, zIndex: 30 })
          // Animate section 1 elements
          const elements = section.querySelectorAll('.fade-element')
          gsap.set(elements, { opacity: 0 })
          gsap.to(elements, {
            opacity: 1,
            duration: 0.8,
            stagger: 0.2,
            delay: 1,
            ease: "power2.out"
          })
        } else {
          gsap.set(section, { opacity: 0, zIndex: 20 })
        }
      }
    })

    // Title animation - only show after loading
    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: -50, visibility: 'visible' })
      gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1.5,
        delay: 1.2,
        ease: "power2.out"
      })
    }

    setIsInitialized(true)

    return () => {
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [isInitialized, isLoading])

  // Mouse parallax effect (only on desktop)
  useEffect(() => {
    if (typeof window === 'undefined' || isMobile || isLoading) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30
      const y = (e.clientY / window.innerHeight - 0.5) * 30

      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          x: -x,
          y: -y,
          duration: 1,
          ease: "power2.out"
        })
      }

      if (titleRef.current) {
        gsap.to(titleRef.current, {
          x: x * 0.5,
          y: y * 0.3,
          duration: 0.8,
          ease: "power2.out"
        })
      }

      // Parallax for visible section elements
      const sections = [section1Ref.current, section2Ref.current, section3Ref.current]
      const currentSectionRef = sections[currentSection]
      if (currentSectionRef) {
        const elements = currentSectionRef.querySelectorAll('.parallax-element')
        elements.forEach((element, index) => {
          gsap.to(element, {
            x: x * (0.2 + index * 0.1),
            y: y * (0.15 + index * 0.05),
            duration: 0.6 + index * 0.1,
            ease: "power2.out"
          })
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [currentSection, isMobile, isLoading])

  // Full-page scroll handling
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return

    let lastScrollTime = 0
    const throttleDelay = 500

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      const now = Date.now()
      if (now - lastScrollTime < throttleDelay || isScrolling) return

      lastScrollTime = now

      const direction = e.deltaY > 0 ? 1 : -1
      const newSection = Math.max(0, Math.min(2, currentSection + direction))

      if (newSection !== currentSection) {
        changeSection(newSection)
      }
    }

    // Touch handling for mobile
    let touchStartY = 0
    let touchEndY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.changedTouches[0].screenY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastScrollTime < throttleDelay || isScrolling) return

      touchEndY = e.changedTouches[0].screenY
      const swipeDistance = touchStartY - touchEndY

      if (Math.abs(swipeDistance) > 50) {
        lastScrollTime = now
        const direction = swipeDistance > 0 ? 1 : -1
        const newSection = Math.max(0, Math.min(2, currentSection + direction))

        if (newSection !== currentSection) {
          changeSection(newSection)
        }
      }
    }

    const preventScroll = (e: Event) => {
      e.preventDefault()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('scroll', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('scroll', preventScroll)
      window.removeEventListener('touchmove', preventScroll)
    }
  }, [currentSection, isScrolling, isLoading])

  const changeSection = (newSection: number) => {
    setIsScrolling(true)

    const sections = [section1Ref.current, section2Ref.current, section3Ref.current]
    const currentSectionRef = sections[currentSection]
    const newSectionRef = sections[newSection]

    const tl = gsap.timeline({
      onComplete: () => {
        setIsScrolling(false)
      }
    })

    // Fade out current section
    if (currentSectionRef) {
      const currentElements = currentSectionRef.querySelectorAll('.fade-element')
      tl.to(currentElements, {
        opacity: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.inOut"
      }, 0)
      tl.set(currentSectionRef, { zIndex: 20 }, 0.3)
    }

    // Fade in new section
    if (newSectionRef) {
      const newElements = newSectionRef.querySelectorAll('.fade-element')
      tl.set(newSectionRef, { opacity: 1, zIndex: 30 }, 0.3)
      tl.set(newElements, { opacity: 0 }, 0.3)
      tl.to(newElements, {
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "power2.inOut"
      }, 0.4)
    }

    setCurrentSection(newSection)
  }

  const handleSection2Click = useCallback(() => {
    setShowQR(!showQR)
  }, [showQR])

  const handleSection3Click = useCallback(() => {
    window.open('https://maps.app.goo.gl/NnjenWecVAneT86dA', '_blank')
  }, [])

  const handleGoHome = () => {
    console.log('🚀 handleGoHome clicked');
    
    const setTargetSection = useNavigationStore.getState().setTargetSection;
    setTargetSection('experience');
    
    console.log('📍 Set targetSection to: experience');
    console.log('🔄 Navigating to home...');
    router.push('/');
  };

  useEffect(() => {
    router.prefetch('/')
  }, [router])

  return (
    <>
      <style jsx global>{`
        @font-face {
          font-family: 'TitleFont';
          src: url('a2.otf') format('truetype');
          font-style: normal;
        }
        
        @font-face {
          font-family: 'NameFont';
          src: url('kyten2.otf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'BodyFont';
          src: url('a2.otf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'LineFont';
          src: url('mon.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        .title-font {
          font-family: 'TitleFont', serif;
        }
        
        .name-font {
          font-family: 'NameFont', sans-serif;
        }

        .body-font {
          font-family: 'BodyFont', sans-serif;
        }
          
        .line-font {
          font-family: 'LineFont', sans-serif;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          touch-action: none;
        }
          
        @keyframes slowRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(244, 228, 188, 0.6)); }
          50% { filter: drop-shadow(0 0 20px rgba(244, 228, 188, 0.8)); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .loading-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }
      `}</style>
      
      {/* Enhanced Loading Screen */}
      {isLoading && (
        <div
          ref={loadingRef}
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[700]"
        >
          {/* Loading Status Debug (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-4 left-4 text-white text-xs space-y-1">
              <div>Fonts: {loadingStatus.fonts ? '✅' : '⏳'}</div>
              <div>Images: {loadingStatus.images ? '✅' : '⏳'}</div>
              <div>DOM: {loadingStatus.dom ? '✅' : '⏳'}</div>
            </div>
          )}

          {/* Loading Text */}
          <div className="mb-8 text-center">
            <h2 className="text-white text-2xl md:text-3xl mb-2 title-font">
              Đang chuẩn bị...
            </h2>
            <p className="text-white/70 text-sm body-font">
              {!loadingStatus.fonts && 'Đang tải fonts...'}
              {loadingStatus.fonts && !loadingStatus.images && 'Đang tải hình ảnh...'}
              {loadingStatus.fonts && loadingStatus.images && !loadingStatus.dom && 'Hoàn thiện...'}
              {resourcesLoaded && 'Sẵn sàng!'}
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="w-64 sm:w-80 md:w-96 lg:w-[500px] mb-6">
            <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                ref={progressBarRef}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-white via-white/90 to-white rounded-full loading-shimmer"
                style={{ width: '0%' }}
              ></div>
            </div>
            
            {/* Progress Percentage */}
            <div className="text-center mt-2">
              <span className="text-white/60 text-xs body-font">
                {Math.round(loadingProgress)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden bg-black"
        style={{ touchAction: 'none' }}
      >
        {/* Background with parallax */}
        <div
          ref={backgroundRef}
          className="absolute inset-0 w-[110%] h-[110%] -top-[5%] -left-[5%]"
          style={{
            backgroundImage: 'url(/sontrangmain.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center left',
            filter: 'grayscale(100%) blur(3px)'
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] md:h-[250px] bg-gradient-to-t from-white via-white/90 to-transparent z-[400]" />

        {/* Home Icon - Top Left */}
        <div className="fixed top-4 sm:top-6 md:top-8 left-4 sm:left-6 md:left-8 z-50">
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full transition-all duration-300 hover:scale-110"
            title="Quay lại trang chủ"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white drop-shadow-lg" />
          </button>
        </div>

        {/* Title - Responsive */}
        <div
          ref={titleRef}
          className="absolute top-[30px] sm:top-16 md:top-24 lg:top-12 left-1/2 transform -translate-x-1/2 z-50 parallax-element"
        >
          <h1 className="text-[50px] sm:text-4xl md:text-6xl lg:text-8xl xl:text-[100px] text-white text-center drop-shadow-2xl title-font whitespace-nowrap ">
            Happy Wedding
          </h1>
        </div>

        {/* Section 1 - Responsive */}
        <div
          ref={section1Ref}
          className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-8 md:pb-0"
          style={{ zIndex: 30 }}
        >
          <div className="relative w-full max-w-[80%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[55%] h-[66vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Left Text - Responsive positioning */}
            <div className="absolute left-2 sm:left-4 md:left-8 lg:left-16 top-[-30px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-1 sm:mb-2 drop-shadow-lg name-font">Hồng Sơn</p>
            </div>

            {/* Right Text - Responsive positioning */}
            <div className="absolute right-2 sm:right-4 md:right-8 lg:right-16 top-[-30px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-4xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-1 sm:mb-2 drop-shadow-lg name-font">Thu Trang</p>
            </div>

            {/* Rectangle - Responsive size */}
            <div className="relative w-44 sm:w-64 md:w-80 lg:w-56 h-full bg-[#fcf8ef] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center pt-4 sm:pt-6 md:pt-8 fade-element backdrop-blur-sm">
              {/* Logo - Responsive và không bị méo */}
              <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-4 w-16 sm:w-20 md:w-24 lg:w-16 h-16 sm:h-20 md:h-24 lg:h-16 relative">
                <Image 
                  src="/namelogo.png"
                  alt="Wedding Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 60px, 60px"
                />
              </div>
            </div>

            {/* Overlay Image - Responsive positioning */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[550px] sm:w-[400px] md:w-[500px] lg:w-[670px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/sontrang1.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center bottom',
                zIndex: 40
              }}
            />
          </div>
        </div>

        {/* Section 2 - Responsive */}
        <div
          ref={section2Ref}
          className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-8 md:pb-0"
          style={{ zIndex: 20 }}
        >
          <div className="relative w-full max-w-[95%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[65%] h-[66vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Centered Text */}
            <div className="absolute left-1/2 top-[-80px] xl:top-[-60px] transform -translate-x-1/2 -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-[21px] sm:text-2xl md:text-3xl lg:text-4xl xl:text-[26px] drop-shadow-lg body-font text-center whitespace-nowrap">
                Chạm vào bông hoa<br />để mừng cưới cho tụi mình nha.<br /><span className='name-font mt-2 text-[25px]'>Thank Youu!</span>
              </p>
            </div>

            {/* Rectangle */}
            <div className="relative w-44 sm:w-64 md:w-80 lg:w-56 h-full bg-[#343434] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center pt-4 sm:pt-6 md:pt-8 parallax-element fade-element backdrop-blur-sm">

              {/* Animated Flower */}
              <div className="mt-4 sm:mt-6 md:mt-4 flex items-center justify-center">
                <svg
                  width="65"
                  height="65"
                  viewBox="0 0 100 100"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(244, 228, 188, 0.8))',
                    animation: 'glowPulse 3s ease-in-out infinite'
                  }}
                >
                  {/* Define gradients */}
                  <defs>
                    {/* Outer petal gradient */}
                    <radialGradient id="outerPetalGradient" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#8FBC8F" />
                      <stop offset="50%" stopColor="#6B8E23" />
                      <stop offset="100%" stopColor="#556B2F" />
                    </radialGradient>
                    
                    {/* Main petal gradient */}
                    <radialGradient id="mainPetalGradient" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFF8DC" />
                      <stop offset="40%" stopColor="#f4e4bc" />
                      <stop offset="100%" stopColor="#DEB887" />
                    </radialGradient>
                    
                    {/* Inner petal gradient */}
                    <radialGradient id="innerPetalGradient" cx="50%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ADFF2F" />
                      <stop offset="50%" stopColor="#9eb46c" />
                      <stop offset="100%" stopColor="#7A8450" />
                    </radialGradient>
                    
                    {/* Center gradients for 3D effect */}
                    <radialGradient id="centerGradient1" cx="30%" cy="30%" r="80%">
                      <stop offset="0%" stopColor="#F5DEB3" />
                      <stop offset="50%" stopColor="#bea374" />
                      <stop offset="100%" stopColor="#8B7355" />
                    </radialGradient>
                    
                    <radialGradient id="centerGradient2" cx="40%" cy="40%" r="70%">
                      <stop offset="0%" stopColor="#FFFACD" />
                      <stop offset="60%" stopColor="#f4e4bc" />
                      <stop offset="100%" stopColor="#DEB887" />
                    </radialGradient>
                    
                    <radialGradient id="centerGradient3" cx="35%" cy="35%" r="60%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="30%" stopColor="#f4e4bc" />
                      <stop offset="100%" stopColor="#F0E68C" />
                    </radialGradient>
                    
                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Outer glow ring */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="rgba(244, 228, 188, 0.2)" 
                    strokeWidth="1"
                    style={{ animation: 'pulse 4s ease-in-out infinite' }}
                  />

                  {/* Outer petals layer */}
                  <g style={{
                    transformOrigin: '50px 50px',
                    animation: 'slowRotate 20s linear infinite'
                  }}>
                    {Array.from({ length: 8 }, (_, i) => (
                      <ellipse
                        key={i}
                        cx="50"
                        cy="25"
                        rx="8"
                        ry="20"
                        fill="#6B8E23"
                        opacity="0.6"
                        transform={`rotate(${i * 45} 50 50)`}
                        style={{ borderRadius: '50%' }}
                      />
                    ))}
                  </g>

                  {/* Main petals layer */}
                  <g style={{
                    transformOrigin: '50px 50px',
                    animation: 'slowRotate 25s linear infinite reverse'
                  }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <ellipse
                        key={i}
                        cx="50"
                        cy="28"
                        rx="7"
                        ry="18"
                        fill="#ffffff"
                        opacity="0.8"
                        transform={`rotate(${i * 30} 50 50)`}
                        style={{ borderRadius: '50%' }}
                      />
                    ))}
                  </g>

                  {/* Inner petals layer */}
                  <g style={{
                    transformOrigin: '50px 50px',
                    animation: 'slowRotate 15s linear infinite'
                  }}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <ellipse
                        key={i}
                        cx="50"
                        cy="32"
                        rx="6"
                        ry="14"
                        fill="#9eb46c"
                        opacity="1"
                        transform={`rotate(${i * 60} 50 50)`}
                        style={{ borderRadius: '50%' }}
                      />
                    ))}
                  </g>

                  {/* 3D Flower center - Multiple layers for depth */}
                  {/* Base shadow layer */}
                  <circle cx="52" cy="52" r="12" fill="rgba(0,0,0,0.2)" opacity="0.4" />
                  
                  {/* Outer center ring */}
                  <circle cx="50" cy="50" r="11" fill="url(#centerGradient1)" opacity="0.9" />
                  
                  {/* Middle center ring */}
                  <circle cx="50" cy="50" r="8" fill="url(#centerGradient2)" opacity="0.85" />
                  
                  {/* Inner center ring */}
                  <circle cx="50" cy="50" r="5" fill="url(#centerGradient3)" opacity="0.9" />
                  
                  {/* Highlight dot for 3D effect */}
                  <circle cx="48" cy="47" r="2" fill="rgba(255,255,255,0.8)" opacity="0.7" />
                  
                  {/* Center core */}
                  <circle cx="50" cy="50" r="2.5" fill="url(#centerGradient3)" opacity="1" />
                </svg>
              </div>

              {showQR && (
                <div className="absolute -top-36 flex items-center rounded-t-[120px] justify-center animate-fade-in backdrop-blur-sm" style={{ zIndex: 60 }}>
                  {/* Backdrop overlay */}
                  <div className="absolute bg-black bg-opacity-0 rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px]"></div>

                  {/* QR Container */}
                  <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                    {/* QR Code */}
                    <div className="w-48 h-48 sm:w-48 sm:h-48 bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                      <Image
                        src="/qrkha1.PNG"
                        alt="QR Code"
                        width={192}
                        height={192}
                        className="w-full h-full object-contain p-2"
                      />
                      {/* Fallback */}
                      <div className="hidden w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center text-gray-500 text-sm text-center rounded-xl">
                        <div className="space-y-2">
                          <div className="w-8 h-8 bg-gray-400 rounded mx-auto opacity-50"></div>
                          <div>QR Code</div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle decoration */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                      <div className="absolute top-2 left-2 w-2 h-2 bg-[#a8d5a8] rounded-full opacity-30"></div>
                      <div className="absolute top-4 right-3 w-1 h-1 bg-[#7fc97f] rounded-full opacity-40"></div>
                      <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-[#90ee90] rounded-full opacity-20"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#a8d5a8] rounded-full opacity-25"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay Image - Responsive positioning */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[460px] sm:w-[400px] md:w-[500px] lg:w-[540px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/sontrang2.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center bottom',
                zIndex: 40
              }}
            />

            {/* Click Area */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-44 sm:w-60 md:w-76 lg:w-80 h-full cursor-pointer transition-all duration-500 hover:scale-105 fade-element"
              onClick={handleSection2Click}
              style={{ zIndex: 45 }}
            />
          </div>
        </div>

        {/* Section 3 - Responsive */}
        <div
          ref={section3Ref}
          className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-8 md:pb-0"
          style={{ zIndex: 20 }}
        >
          <div className="relative w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[80%] h-[66vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Left Text */}
            <div className="absolute left-2 sm:left-4 md:left-8 lg:left-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl sm:mb-2 xl:ml-40 drop-shadow-lg body-font">Chủ nhật / Thứ Hai</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg xl:ml-40 body-font">Ngày 13-14.07.2025</p>
            </div>

            {/* Right Text */}
            <div className="absolute right-2 sm:right-4 md:right-8 lg:right-32 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-3xl sm:mb-2 drop-shadow-lg body-font">Thôn Bách Nhẫn, Xã Mai Trung,</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg body-font">Huyện Hiệp Hoà, Tỉnh Bắc Giang</p>
            </div>

            {/* Rectangle */}
            <div className="relative w-44 sm:w-64 md:w-80 lg:w-56 h-full bg-gradient-to-b from-[#fcf8ef] via-[#faf6ed] to-[#f8f4e9] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center  parallax-element fade-element backdrop-blur-sm overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-3xl hover:scale-105">
  
              {/* Simple animated icon */}
              <div className="relative pt-8">
                <div className="bg-[#53484E] p-3 sm:p-5 md:p-4 rounded-full shadow-lg transform transition-all duration-500 group-hover:scale-110">
                  <MapPinHouse className="w-6 h-6 sm:w-10 sm:h-10 md:w-8 md:h-8 text-white animate-pulse" />
                </div>
                
                {/* Subtle pulse ring */}
                <div className="absolute inset-0 -m-1 border-2 border-[#53484E] rounded-full animate-ping opacity-15"></div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#53484E]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[inherit]"></div>
            </div>

            {/* Overlay Image - Responsive positioning */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[350px] sm:w-[400px] md:w-[500px] lg:w-[420px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/sontrang4.png)',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center bottom',
                zIndex: 40
              }}
            />

            {/* Click Area */}
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-44 sm:w-60 md:w-76 lg:w-80 h-full cursor-pointer transition-all duration-500 hover:scale-105 fade-element"
              onClick={handleSection3Click}
              style={{ zIndex: 45 }}
            />
          </div>
        </div>

        {/* Section Indicators - Responsive */}
        <div className="fixed right-4 sm:right-6 md:right-8 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-2 sm:space-y-3 md:space-y-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`w-2 h-2 sm:w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${currentSection === index ? 'bg-white scale-125 shadow-lg' : 'bg-white/50'
                }`}
              onClick={() => changeSection(index)}
            />
          ))}
        </div>

        {/* Scroll indicator - Responsive */}
        <div className="absolute bottom-24 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 text-[#272727] text-center z-[500]">
          <div className="animate-bounce">
            <div className="w-4 h-5 sm:w-5 h-8 md:w-6 h-10 border-[1px] border-[#272727] rounded-full mx-auto mb-1 sm:mb-2">
              <div className="w-[1px] h-2 sm:w-1 h-2 bg-[#272727] rounded-full mx-auto mt-1 sm:mt-2 animate-pulse"></div>
            </div>
            <p className="text-[16px] sm:text-sm body-font tracking-wide">
              {isMobile ? 'Lướt xuống nha' : 'Lướt xuống nha'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}