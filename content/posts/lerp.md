+++
title = "When lerp isn't linear"
date = 2024-07-13T04:01:40-04:00
draft = false
+++

You will frequently come across code in the wild that vaguely resembles this:

```C#
// Most engines will provide a lerp for you
T lerp(T a, T b, float t) {
    return a + t * (b - a);
}

void update(float delta) {
    position = lerp(position, destination, delta);
}
```
Perhaps even multiplying the speed by delta in the `t` parameter.

At face value, it seems to *work*, but it's probably not doing what you think
it's doing. Lerp is not a smoothing function, it is for linearly interpolating a
value across a line from `a` to `b` by the factor `t`. If you are repeatedly
changing the `a` and/or `b` values, you are using lerp **incorrectly** — it is no
longer linear.

What you are doing is applying a telescoping function — it is a geometric
series. `position` will nonlinearly(asymptotically) approach `destination`,
which creates the desired appearance of smoothing.


# What to use instead?

If you just want to move `a` towards `b` at a constant speed, you do **not**
want or need `lerp`. The Godot engine provides a function named `move_toward`
that does exactly what you want. This is how it's implemented in the C++
source:
```C++
static double move_toward(double p_from, double p_to, double p_delta) {
    return abs(p_to - p_from) <= p_delta ? p_to : p_from + SIGN(p_to - p_from) * p_delta;
}
```

## What if you want to smoothly move `a` towards `b`?


Game Programming Gems IV(2004) book, Chapter 1.10 "Critically Damped
Ease-In/Ease-Out Smoothing" describes an implementation of smoothing based on a
critically damped spring model.
![Image](/images/spring.webp)

I'm borrowing this implementation from Unity's reference source code for
demonstration:
```C#
public static float SmoothDamp(float current, float target, ref float currentVelocity, float smoothTime, float maxSpeed, float deltaTime)
{
    smoothTime = Mathf.Max(0.0001F, smoothTime);
    float omega = 2F / smoothTime;

    float x = omega * deltaTime;
    float exp = 1F / (1F + x + 0.48F * x * x + 0.235F * x * x * x);
    float change = current - target;
    float originalTo = target;

    // Clamp maximum speed
    float maxChange = maxSpeed * smoothTime;
    change = Mathf.Clamp(change, -maxChange, maxChange);
    target = current - change;

    float temp = (currentVelocity + omega * change) * deltaTime;
    currentVelocity = (currentVelocity - omega * temp) * exp;
    float output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0F == output > originalTo)
    {
        output = originalTo;
        currentVelocity = (output - originalTo) / deltaTime;
    }

    return output;
}
```

Unity's documentation defines the parameters as following:
| Parameter | Description |
| --------- | ----------- |
| current | The current value. |
| target | The target value. |
| currentVelocity | Use this parameter to specify the initial velocity to move the current value towards the target value. This method updates the currentVelocity based on this movement and smooth-damping. |
| smoothTime | The approximate time it takes for the current value to reach the target value. The lower the smoothTime, the faster the current value reaches the target value. The minimum smoothTime is 0.0001. If a lower value is specified, it is clamped to the minimum value. |
| maxSpeed | Use this optional parameter to specify a maximum speed. By default, the maximum speed is set to infinity. |
| deltaTime | The time since this method was last called. By default, this is set to `Time.deltaTime`. |

I find it practical to define `smooth_time` as `distance` / `desired_velocity`,
as we often know the velocity we want when smoothing.
If you want it to also ease out, apply `sqrt` to `smooth_time`. Additionally,
you'll want to set `max_speed` to `desired_velocity`.
