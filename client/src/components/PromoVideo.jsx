import React from 'react'
import freshyPromo from './videos/Video quảng cáo Nông sản sạch Freshy Đà Lạt _ Lamago Media.mp4'

const PromoVideo = ({ onCtaClick }) => {
  return (
    <section className='mt-12 relative overflow-hidden rounded-3xl bg-black shadow-lg'>
      <video
        className='w-full h-[240px] sm:h-[320px] md:h-[420px] object-cover opacity-80'
        autoPlay
        muted
        loop
        playsInline
        poster='https://images.pexels.com/photos/4050928/pexels-photo-4050928.jpeg?auto=compress&cs=tinysrgb&w=1200'
      >
        <source
          src={freshyPromo}
          type='video/mp4'
        />
        Trình duyệt của bạn không hỗ trợ phát video.
      </video>

      <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent'>
        <div className='h-full w-full flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-8 text-white'>
          <p className='uppercase tracking-[0.3em] text-xs sm:text-sm text-primary font-semibold'>
            GreenCart TV
          </p>
          <h2 className='mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold max-w-xl leading-snug'>
            Ngắm nhìn nguồn nông sản xanh chuẩn hữu cơ mỗi ngày
          </h2>
          <p className='mt-4 text-sm sm:text-base md:text-lg max-w-2xl text-white/85'>
            Video ghi lại hành trình thu hoạch, sơ chế và giao nhanh trong 30 phút. Hãy để GreenCart
            đồng hành trên bàn ăn của gia đình bạn.
          </p>
          <div className='mt-6'>
            <button
              type='button'
              onClick={onCtaClick}
              className='inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm sm:text-base font-semibold shadow-lg shadow-primary/40 transition hover:bg-primary-dull'
            >
              Khám phá sản phẩm tươi nhất
              <span aria-hidden='true'>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromoVideo

