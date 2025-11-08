import React, { useState, useEffect } from 'react';
import { Zap, Target, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Richard Hendricks",
      role: "CEO & Founder",
      company: "Pied Piper",
      content: "Planning Poker has transformed our sprint planning. We went from hour-long debates to 15-minute consensus decisions. The real-time voting keeps everyone engaged and focused.",
      rating: 5,
      avatar: "RH"
    },
    {
      name: "Gavin Belson",
      role: "CEO",
      company: "Hooli",
      content: "The accuracy of our estimates improved by 40% after switching to this tool. The Fibonacci sequence integration and team anonymity features work perfectly for honest estimations.",
      rating: 5,
      avatar: "GB"
    },
    {
      name: "Erlich Bachman",
      role: "Entrepreneur",
      company: "Pied Piper",
      content: "Love how it handles distributed teams seamlessly. No more waiting for everyone to be in the same room. The interface is intuitive and the real-time updates keep the momentum going.",
      rating: 5,
      avatar: "EB"
    },
    {
      name: "Jared Dunn",
      role: "Chief Operating Officer",
      company: "Hooli",
      content: "Our planning sessions are now more inclusive and democratic. Junior developers feel comfortable sharing their estimates, leading to better team buy-in and more accurate project timelines.",
      rating: 5,
      avatar: "JD"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonial(index);
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Voting",
      description: "Vote simultaneously with your team"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Accurate Estimates",
      description: "Get consensus on story points"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Fast Sessions",
      description: "Complete planning in minutes"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-primary-50/30 relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* 3D Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid container with perspective */}
        <div className="absolute inset-0 grid-bg">
          {/* Grid lines */}
          <div className="grid-lines"></div>

          {/* Floating particles */}
          <div className="particles">
            <div className="particle particle-1"></div>
            <div className="particle particle-2"></div>
            <div className="particle particle-3"></div>
            <div className="particle particle-4"></div>
            <div className="particle particle-5"></div>
            <div className="particle particle-6"></div>
            <div className="particle particle-7"></div>
            <div className="particle particle-8"></div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-grow">
        {/* Hero Section */}
        <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 min-h-full">
          <div className="max-w-7xl mx-auto w-full">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Real-time Agile Estimation Tool
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Estimate Better,
                <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  Ship Faster
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Streamline your sprint planning with real-time collaborative estimation.
                Get accurate story points and reach consensus faster than ever.
              </p>
            </div>

            {/* Features Grid */}
            <div id="features" className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Testimonials Carousel */}
            <div className="mt-20 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Loved by Agile Teams Worldwide
                </h2>
                <p className="text-lg text-slate-600">
                  See what teams are saying about their Planning Poker experience
                </p>
              </div>

              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/30">
                {/* Testimonial Content */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-lg md:text-xl text-slate-700 mb-8 italic leading-relaxed">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center justify-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-900">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-slate-600">
                        {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevTestimonial}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>

                  {/* Dots */}
                  <div className="flex space-x-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentTestimonial
                            ? 'bg-blue-600 scale-125'
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextTestimonial}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Client Marquee */}
            <div className="mt-20">
              <div className="text-center mb-8">
                <p className="text-slate-600 text-sm font-medium uppercase tracking-wider">
                  Trusted by teams at
                </p>
              </div>

              <div className="relative overflow-hidden bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="marquee-container">
                  <div className="marquee-content flex items-center space-x-12">
                    {/* First set of logos */}
                    <div className="flex items-center space-x-12 min-w-max">
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Pied Piper</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Hooli</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-700 to-primary-800 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Raviga</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Endframe</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Aviato</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-700 to-primary-800 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Nucleus</span>
                        </div>
                      </div>
                    </div>

                    {/* Duplicate set for seamless loop */}
                    <div className="flex items-center space-x-12 min-w-max">
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Pied Piper</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Hooli</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-700 to-primary-800 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Raviga</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Endframe</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Aviato</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-primary-700 to-primary-800 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">Nucleus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Comprehensive Footer */}
      <footer className="flex-shrink-0 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PP</span>
                </div>
                <span className="text-xl font-bold">Planning Poker</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Streamline your agile development process with real-time collaborative estimation tools designed for modern development teams.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Integrations</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">API</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Security</a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Press</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Contact</a></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Community</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">Status</a></li>
              </ul>

              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold mb-2">Legal</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-xs">Privacy Policy</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-xs">Terms of Service</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-slate-300 transition-colors text-xs">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-slate-400 text-sm">
                © 2025 Planning Poker. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <span>📍 San Francisco, CA</span>
                <span>📧 hello@planningpoker.app</span>
                <span>📞 +1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
          .grid-bg {
            perspective: 1000px;
            transform-style: preserve-3d;
          }

          .grid-lines::before,
          .grid-lines::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
              linear-gradient(rgba(33, 150, 243, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(33, 150, 243, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
          }

          .grid-lines::after {
            background-image:
              linear-gradient(rgba(25, 118, 210, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(25, 118, 210, 0.08) 1px, transparent 1px);
            background-size: 100px 100px;
            animation: gridMove 30s linear infinite reverse;
            transform: rotateX(60deg) translateZ(50px);
          }

          .particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: linear-gradient(45deg, rgba(33, 150, 243, 0.6), rgba(30, 136, 229, 0.6));
            border-radius: 50%;
            animation: particleFloat 8s ease-in-out infinite;
          }

          .particle-1 { top: 20%; left: 10%; animation-delay: 0s; }
          .particle-2 { top: 40%; right: 15%; animation-delay: 1s; }
          .particle-3 { bottom: 30%; left: 20%; animation-delay: 2s; }
          .particle-4 { bottom: 20%; right: 10%; animation-delay: 3s; }
          .particle-5 { top: 60%; left: 70%; animation-delay: 4s; }
          .particle-6 { top: 10%; right: 60%; animation-delay: 5s; }
          .particle-7 { bottom: 60%; left: 80%; animation-delay: 6s; }
          .particle-8 { bottom: 10%; right: 70%; animation-delay: 7s; }

          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }

          @keyframes particleFloat {
            0%, 100% {
              transform: translateY(0px) translateZ(0px);
              opacity: 0.3;
            }
            50% {
              transform: translateY(-30px) translateZ(20px);
              opacity: 0.8;
            }
          }

          .marquee-container {
            overflow: hidden;
            width: 100%;
          }

          .marquee-content {
            animation: marqueeScroll 30s linear infinite;
          }

          .client-logo {
            opacity: 0.8;
            transition: opacity 0.3s ease;
          }

          .client-logo:hover {
            opacity: 1;
          }

          @keyframes marqueeScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `
      }} />
    </div>
  );
};

export default HomePage;
