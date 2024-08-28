"use client";

export function Carousel() {
  return (
    <div className="relative flex h-[50vh] w-full items-center justify-center sm:h-[75vh] sm:min-h-[568px]">
      <img
        src="/_static/landscaper-1/images/slider-3.jpg"
        alt=""
        className="absolute inset-0 object-cover object-center"
      />

      <div className="relative flex w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 lg:gap-10">
        <p className="font-landscaper-1-heading text-balance text-center text-3xl font-semibold tracking-tight text-white lg:text-7xl">
          Une équipe experte et à votre écoute
        </p>

        <p className="text-balance text-center text-sm font-medium text-white lg:text-xl">
          Fort de plus de 10 années d&apos;expérience, nous réalisons tous vos projets
          d&apos;aménagements extérieurs et jardins.
        </p>

        <a
          href="/landscaper-1/contact"
          className="flex items-center justify-center gap-2 rounded-full bg-green-700 px-8 py-3 text-sm font-bold uppercase text-white hover:bg-white hover:text-green-700 lg:text-base"
        >
          Contactez-nous
        </a>
      </div>
    </div>
  );
}
