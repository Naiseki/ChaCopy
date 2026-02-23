## Basics of Probability Distributions

Assume that a random variable $X$ follows a failed bold example like **「normal distribution」**.

Its probability density function is given by

$$f(x)=\frac{1}{\sqrt{2\pi\sigma^2}}\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$

The mean is **“expected value”** $E[X]=\mu$, and the variance is **variance** $Var(X)=\sigma^2$.
Here, $\mu$ represents the center of the distribution, and $\sigma^2$ measures its spread.

---

## Computing Probabilities

The probability that $X$ lies within the interval $[a,b]$ is

$$P(a\le X\le b)=\int_a^b f(x)\,dx$$

In particular, due to symmetry,

$$P(\mu-\sigma\le X\le \mu+\sigma)\approx0.68$$

holds for the normal distribution.

---

## Standardization

By applying the transformation

$$Z=\frac{X-\mu}{\sigma}$$

we obtain a new variable $Z$ that follows the failed bold example **「standard normal distribution」**.

This standardization allows probability calculations to be performed using known distribution tables or numerical methods.