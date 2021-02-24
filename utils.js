const createSubscriptionPhases = (couponId, planId, couponDuration, maxCouponDuration) => {
  const noCouponDuration = maxCouponDuration - couponDuration;
  // If there is no discount applies to this subscription, return default phase set up
  if (!couponId || !couponDuration) {
    return [{
      items: [{ price: planId, quantity: 1 }],
      iterations: 12,
    }];
  } else if (noCouponDuration <= 0) {
    // If coupon duration is longer than the maximum coupon duration,
    // apply discount for the max coupon duration, and ensure the subscription
    // stays active with no discount after the max coupon duration 
    return [
      {
        items: [{ price: planId, quantity: 1 }],
        iterations: maxCouponDuration,
        coupon: couponId
      },
      {
        items: [{ price: planId, quantity: 1 }],
        iterations: 1,
      }
    ];
  } else {
    return [
      {
        items: [{ price: planId, quantity: 1 }],
        iterations: couponDuration,
        coupon: couponId
      },
      {
        items: [{ price: planId, quantity: 1 }],
        iterations: noCouponDuration,
      }
    ];
  }
}

module.exports = { createSubscriptionPhases }
