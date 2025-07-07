export function detectProductCategory(productName: string): string | null {
  const lowerName = productName.toLowerCase();
  
  // Electronics
  if (lowerName.includes('phone') || lowerName.includes('iphone') || lowerName.includes('samsung') ||
      lowerName.includes('android') || lowerName.includes('smartphone') || lowerName.includes('mobile') ||
      lowerName.includes('laptop') || lowerName.includes('computer') || lowerName.includes('pc') ||
      lowerName.includes('tablet') || lowerName.includes('ipad') || lowerName.includes('macbook') ||
      lowerName.includes('camera') || lowerName.includes('tv') || lowerName.includes('television') ||
      lowerName.includes('headphone') || lowerName.includes('speaker') || lowerName.includes('earbud') ||
      lowerName.includes('gaming') || lowerName.includes('console') || lowerName.includes('playstation') ||
      lowerName.includes('xbox') || lowerName.includes('nintendo') || lowerName.includes('switch')) {
    return 'electronics';
  }
  
  // Fashion
  if (lowerName.includes('shirt') || lowerName.includes('dress') || lowerName.includes('pant') ||
      lowerName.includes('jean') || lowerName.includes('shoe') || lowerName.includes('sneaker') ||
      lowerName.includes('boot') || lowerName.includes('jacket') || lowerName.includes('coat') ||
      lowerName.includes('suit') || lowerName.includes('tie') || lowerName.includes('watch') ||
      lowerName.includes('jewelry') || lowerName.includes('bag') || lowerName.includes('purse') ||
      lowerName.includes('wallet') || lowerName.includes('belt') || lowerName.includes('hat') ||
      lowerName.includes('cap') || lowerName.includes('scarf') || lowerName.includes('glove') ||
      lowerName.includes('sock') || lowerName.includes('underwear') || lowerName.includes('lingerie')) {
    return 'fashion';
  }
  
  // Home
  if (lowerName.includes('furniture') || lowerName.includes('chair') || lowerName.includes('table') ||
      lowerName.includes('bed') || lowerName.includes('sofa') || lowerName.includes('couch') ||
      lowerName.includes('lamp') || lowerName.includes('light') || lowerName.includes('mirror') ||
      lowerName.includes('curtain') || lowerName.includes('carpet') || lowerName.includes('rug') ||
      lowerName.includes('pillow') || lowerName.includes('blanket') || lowerName.includes('sheet') ||
      lowerName.includes('towel') || lowerName.includes('kitchen') || lowerName.includes('appliance') ||
      lowerName.includes('refrigerator') || lowerName.includes('stove') || lowerName.includes('oven') ||
      lowerName.includes('microwave') || lowerName.includes('dishwasher') || lowerName.includes('washer') ||
      lowerName.includes('dryer') || lowerName.includes('vacuum') || lowerName.includes('cleaner')) {
    return 'home';
  }
  
  // Automotive
  if (lowerName.includes('car') || lowerName.includes('truck') || lowerName.includes('suv') ||
      lowerName.includes('motorcycle') || lowerName.includes('bike') || lowerName.includes('bicycle') ||
      lowerName.includes('tire') || lowerName.includes('wheel') || lowerName.includes('engine') ||
      lowerName.includes('battery') || lowerName.includes('oil') || lowerName.includes('filter') ||
      lowerName.includes('brake') || lowerName.includes('clutch') || lowerName.includes('transmission') ||
      lowerName.includes('exhaust') || lowerName.includes('muffler') || lowerName.includes('radiator') ||
      lowerName.includes('alternator') || lowerName.includes('starter') || lowerName.includes('ignition')) {
    return 'automotive';
  }
  
  // Beauty
  if (lowerName.includes('makeup') || lowerName.includes('cosmetic') || lowerName.includes('perfume') ||
      lowerName.includes('cologne') || lowerName.includes('skincare') || lowerName.includes('cream') ||
      lowerName.includes('lotion') || lowerName.includes('soap') || lowerName.includes('shampoo') ||
      lowerName.includes('conditioner') || lowerName.includes('hair') || lowerName.includes('nail') ||
      lowerName.includes('polish') || lowerName.includes('brush') || lowerName.includes('mirror') ||
      lowerName.includes('razor') || lowerName.includes('shave') || lowerName.includes('deodorant') ||
      lowerName.includes('toothpaste') || lowerName.includes('toothbrush') || lowerName.includes('floss')) {
    return 'beauty';
  }
  
  // Sports
  if (lowerName.includes('sport') || lowerName.includes('fitness') || lowerName.includes('exercise') ||
      lowerName.includes('gym') || lowerName.includes('workout') || lowerName.includes('running') ||
      lowerName.includes('jogging') || lowerName.includes('walking') || lowerName.includes('hiking') ||
      lowerName.includes('camping') || lowerName.includes('fishing') || lowerName.includes('hunting') ||
      lowerName.includes('golf') || lowerName.includes('tennis') || lowerName.includes('basketball') ||
      lowerName.includes('football') || lowerName.includes('soccer') || lowerName.includes('baseball') ||
      lowerName.includes('volleyball') || lowerName.includes('swimming') || lowerName.includes('cycling') ||
      lowerName.includes('yoga') || lowerName.includes('pilates') || lowerName.includes('dance')) {
    return 'sports';
  }
  
  return null;
} 