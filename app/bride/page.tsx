'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Home,MapPinHouse } from 'lucide-react'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function GroomPage() {
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

  // Loading animation
  useEffect(() => {
    if (typeof window === 'undefined' || !isReady) return

    // Simulate loading progress
    const loadingTimer = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingTimer)
          
          // Start fade out animation after loading completes
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
          }, 500)
          
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    // Animate progress bar
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: `${loadingProgress}%`,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    return () => clearInterval(loadingTimer)
  }, [loadingProgress, isReady])

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
    const throttleDelay = 500 // 1 second throttle
    
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
      
      if (Math.abs(swipeDistance) > 50) { // Minimum swipe distance
        lastScrollTime = now
        const direction = swipeDistance > 0 ? 1 : -1
        const newSection = Math.max(0, Math.min(2, currentSection + direction))
        
        if (newSection !== currentSection) {
          changeSection(newSection)
        }
      }
    }

    // Prevent default scroll behavior
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
    window.open('https://maps.app.goo.gl/a1N6Auntpp1bmXGV7', '_blank')
  }, [])

  // Thêm function để quay về trang chủ
  const handleGoHome = () => {
    // Có thể thay đổi theo nhu cầu của bạn
    window.location.href = '/'; // hoặc window.history.back();
  };

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

        /* Ensure no scrollbars */
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          touch-action: none;
        }
      `}</style>
{/* Loading Screen */}
      {isLoading && (
        <div 
          ref={loadingRef}
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]"
        >

          {/* Progress Bar Container */}
          <div className="w-64 sm:w-80 md:w-96 lg:w-[500px] mb-6">
            <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                ref={progressBarRef}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-white via-white/90 to-white rounded-full loading-shimmer"
                style={{ width: `${loadingProgress}%` }}
              ></div>
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
            backgroundImage: 'url(/kha2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(90%) blur(2px)'
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[200px] md:h-[400px] bg-gradient-to-t from-white/40 via-white/30 to-transparent z-15" />

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
          className="absolute top-8 sm:top-16 md:top-24 lg:top-32 left-1/2 transform -translate-x-1/2 z-50 parallax-element px-4"
        >
          <h1 className="text-5xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-[180px] text-white text-center drop-shadow-2xl title-font ">
            Happy Wedding
          </h1>
        </div>

        {/* Section 1 - Responsive */}
        <div 
          ref={section1Ref}
          className="absolute inset-0 flex items-end justify-center pb-4 sm:pb-8 md:pb-0"
          style={{ zIndex: 30 }}
        >
          <div className="relative w-full max-w-[80%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[45%] h-[65vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Left Text - Responsive positioning */}
            <div className="absolute left-2 sm:left-4 md:left-8 lg:left-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-5xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-1 sm:mb-2 drop-shadow-lg name-font">Hồng Sơn</p>
            </div>

            {/* Right Text - Responsive positioning */}
            <div className="absolute right-2 sm:right-4 md:right-8 lg:right-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-5xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-1 sm:mb-2 drop-shadow-lg name-font">Thu Trang</p>
            </div>

            {/* Rectangle - Responsive size */}
            <div className="relative w-52 sm:w-64 md:w-80 lg:w-96 h-full bg-[#fcf8ef] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center pt-4 sm:pt-6 md:pt-8 fade-element backdrop-blur-sm">
            </div>
            
            {/* Overlay Image - Responsive positioning */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[350px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/sontrang.png)',
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
          <div className="relative w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[65%] h-[65vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Left Text */}
            <div className="absolute left-2 sm:left-4 md:left-8 lg:left-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl sm:mb-2 xl:ml-40 drop-shadow-lg body-font">Chủ nhật / Thứ Hai</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg xl:ml-40 body-font">Ngày 13-14.07.2025</p>
            </div>

            {/* Right Text */}
            <div className="absolute right-2 sm:right-4 md:right-8 lg:right-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl sm:mb-2 drop-shadow-lg body-font">Thôn Châu Lỗ, Xã Mai Đình,</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg body-font">Huyện Hiệp Hoà, Tính Bắc Giang</p>
            </div>

            {/* Rectangle */}
            <div className="relative w-52 sm:w-64 md:w-80 lg:w-96 h-full bg-[#fcf8ef] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center pt-4 sm:pt-6 md:pt-8 parallax-element fade-element backdrop-blur-sm">
              <p className="text-[#272727] text-base sm:text-base md:text-lg lg:text-xl mt-4 sm:mb-4 text-center drop-shadow-lg body-font">Ấn vào đây để<br/> mừng cưới tụi mình nhé.<br/>Thank youu !</p>
              
              {showQR && (
                <div className="absolute p-2 inset-0 sm:inset-4 rounded-t-[120px] bg-[#fcf8ef] sm:rounded-2xl flex items-center justify-center animate-fade-in backdrop-blur-sm" style={{ zIndex: 60 }}>
                  <div className="w-full sm:w-40 md:w-48 h-full sm:h-40 md:h-48 bg-gradient-to-b from-[#fcf8ef] to-[#fcf8ef] flex justify-center rounded-[120px] sm:rounded-xl">
                    <div className="w-48 absolute top-[-10px] sm:w-36 md:w-40 h-48 sm:h-36 md:h-40 bg-white shadow-xl">
                      <img 
                        src="/qrkha1.PNG" 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback nếu ảnh không load được
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback text nếu ảnh không load được */}
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-gray-600 text-xs sm:text-sm text-center p-2 rounded">
                        QR Code<br/>Image
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overlay Image */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/a55.png)',
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
          <div className="relative w-full max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[65%] h-[65vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center">
            {/* Left Text */}
            <div className="absolute left-2 sm:left-4 md:left-8 lg:left-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl sm:mb-2 xl:ml-40 drop-shadow-lg body-font">Chủ nhật / Thứ Hai</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg xl:ml-40 body-font">Ngày 13-14.07.2025</p>
            </div>

            {/* Right Text */}
            <div className="absolute right-2 sm:right-4 md:right-8 lg:right-16 top-[-60px] sm:top-1/3 transform -translate-y-1/2 text-white parallax-element fade-element">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl sm:mb-2 drop-shadow-lg body-font">Thôn Châu Lỗ, Xã Mai Đình,</p>
              <p className="text-base sm:text-sm md:text-base opacity-90 drop-shadow-lg body-font">Huyện Hiệp Hoà, Tính Bắc Giang</p>
            </div>

            {/* Rectangle */}
            <div className="relative w-52 sm:w-64 md:w-80 lg:w-96 h-full bg-[#fcf8ef] rounded-t-[120px] sm:rounded-t-[120px] md:rounded-t-[160px] lg:rounded-t-[180px] shadow-2xl flex flex-col items-center pt-4 sm:pt-6 md:pt-8 parallax-element fade-element backdrop-blur-sm">
              <p className="text-[#272727] text-base sm:text-base md:text-lg lg:text-xl mt-4 sm:mb-4 drop-shadow-lg text-center body-font">Ấn vào đây để<br/>xem địa điểm lễ cưới.</p>
              <MapPinHouse className="w-5 h-5 sm:w-12 h-12 md:w-16 h-16 text-[#272727] mt-2 sm:mb-4 drop-shadow-lg" />
            </div>
            
            {/* Overlay Image */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-full fade-element pointer-events-none"
              style={{
                backgroundImage: 'url(/a55.png)',
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
              className={`w-2 h-2 sm:w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                currentSection === index ? 'bg-white scale-125 shadow-lg' : 'bg-white/50'
              }`}
              onClick={() => changeSection(index)}
            />
          ))}
        </div>

        {/* Scroll indicator - Responsive */}
        <div className="absolute bottom-24 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 text-white text-center">
          <div className="animate-bounce">
            <div className="w-4 h-6 sm:w-5 h-8 md:w-6 h-10 border-2 border-white rounded-full mx-auto mb-1 sm:mb-2">
              <div className="w-0.5 h-2 sm:w-1 h-3 bg-white rounded-full mx-auto mt-1 sm:mt-2 animate-pulse"></div>
            </div>
            <p className="text-xs sm:text-sm opacity-75 body-font">
              {isMobile ? 'Lướt xuống nha' : 'Lướt xuống nha'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}