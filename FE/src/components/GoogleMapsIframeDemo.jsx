import React from 'react';
import GoogleMapsIframe from './GoogleMapsIframe';

const GoogleMapsIframeDemo = () => {
  const defaultMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1165.2492695919093!2d106.6915141845364!3d10.779411797641998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6678c2f1877db309%3A0xfb6bc68a2cae31af!2zTWFzc2FnZSBNaW5oIFTDom0gTMOqIFF1w70gxJDDtG4!5e0!3m2!1svi!2s!4v1760241934224!5m2!1svi!2s";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Google Maps Iframe Component Demo</h1>
      
      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">1. Basic Usage</h2>
          <GoogleMapsIframe
            src={defaultMapUrl}
            title="Bản đồ Google Maps cơ bản"
          />
        </section>

        {/* With Custom Styling */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">2. Custom Styling</h2>
          <GoogleMapsIframe
            src={defaultMapUrl}
            title="Bản đồ với styling tùy chỉnh"
            className="border-4 border-emerald-500"
          />
        </section>

        {/* With Callbacks */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">3. With Load/Error Callbacks</h2>
          <GoogleMapsIframe
            src={defaultMapUrl}
            title="Bản đồ với callbacks"
            onLoad={() => console.log('Map loaded successfully!')}
            onError={() => console.log('Map failed to load!')}
          />
        </section>

        {/* Different Aspect Ratios */}
        <section>
          <h2 className="text-xl font-semibold text-slate-700 mb-4">4. Different Sizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Square (1:1)</h3>
              <div className="aspect-square">
                <GoogleMapsIframe
                  src={defaultMapUrl}
                  title="Bản đồ vuông"
                  className="h-full"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-600 mb-2">Wide (21:9)</h3>
              <div className="aspect-[21/9]">
                <GoogleMapsIframe
                  src={defaultMapUrl}
                  title="Bản đồ rộng"
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GoogleMapsIframeDemo;
