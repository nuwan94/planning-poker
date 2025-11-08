import React, { useState, useEffect } from 'react';
import { Plus, Users, Zap, Target, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

const HomePage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      content: "Planning Poker has transformed our sprint planning. We went from hour-long debates to 15-minute consensus decisions. The real-time voting keeps everyone engaged and focused.",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Scrum Master",
      company: "AgileSoft",
      content: "The accuracy of our estimates improved by 40% after switching to this tool. The Fibonacci sequence integration and team anonymity features work perfectly for honest estimations.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Lead Developer",
      company: "DevFlow",
      content: "Love how it handles distributed teams seamlessly. No more waiting for everyone to be in the same room. The interface is intuitive and the real-time updates keep the momentum going.",
      rating: 5,
      avatar: "EW"
    },
    {
      name: "David Kim",
      role: "Engineering Manager",
      company: "InnovateLab",
      content: "Our planning sessions are now more inclusive and democratic. Junior developers feel comfortable sharing their estimates, leading to better team buy-in and more accurate project timelines.",
      rating: 5,
      avatar: "DK"
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative min-h-screen flex flex-col">
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
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Ship Faster
                </span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Streamline your sprint planning with real-time collaborative estimation.
                Get accurate story points and reach consensus faster than ever.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 min-w-[200px]"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Create Room
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="group px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 min-w-[200px] border border-slate-200"
                >
                  <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Join Room
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div id="features" className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white mb-4">
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
                        <div className="w-32 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">TechCorp</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">AgileSoft</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">DevFlow</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">InnovateLab</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">CodeWorks</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SprintPro</span>
                        </div>
                      </div>
                    </div>

                    {/* Duplicate set for seamless loop */}
                    <div className="flex items-center space-x-12 min-w-max">
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">TechCorp</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">AgileSoft</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">DevFlow</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">InnovateLab</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">CodeWorks</span>
                        </div>
                      </div>
                      <div className="client-logo">
                        <div className="w-32 h-12 bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">SprintPro</span>
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

      {/* Footer */}
      <footer className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-600">
            Built for agile teams who value accurate estimation and efficient planning.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
        />
      )}
      {showJoinModal && (
        <JoinRoomModal
          isOpen={showJoinModal}
          onClose={handleModalClose}
        />
      )}

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
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
          }

          .grid-lines::after {
            background-image:
              linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px);
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
            background: linear-gradient(45deg, rgba(59, 130, 246, 0.6), rgba(99, 102, 241, 0.6));
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
