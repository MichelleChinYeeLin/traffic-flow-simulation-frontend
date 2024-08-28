const RoadIcon = () => {
  return (
    <svg
      className="w-fit h-full"
      width="24"
      height="24"
      viewBox="0 0 48 48"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg">
      <g
        id="road"
        stroke="none"
        strokeWidth="1"
        fill="none"
        fillRule="evenodd"
        strokeLinecap="round"
        strokeLinejoin="round">
        <rect width="48" height="48" fill="none" fillOpacity="0.01" />
        <g transform="translate(6.000000, 5.091863)" stroke="currentColor" strokeWidth="4">
          <path d="M5,0.908136641 L0,36.9081366"></path>
          <path
            d="M36.9287415,0.908136641 L31.9643708,36.8633744"
            transform="translate(33.964371, 18.886476) scale(-1, 1) translate(-33.964371, -18.886476) "></path>
          <path d="M18,0.908136641 L18,6.90813664"></path>
          <path d="M18,29.9081366 L18,36.9081366"></path>
          <path d="M18,14.9081366 L18,21.9081366"></path>
        </g>
      </g>
    </svg>
  );
};

export default RoadIcon;
