/**
 * The testimonials on /testimonials. Text from the old site (en-us.json
 * testimonials_*), with the link targets of the old layout. `html` can hold
 * links; `cite` is null when the author is not known.
 *
 * @typedef {{ html: string, cite: string | null }} Testimonial
 */

/** @type {Testimonial[]} */
export const TESTIMONIALS = [
    {
        html: `Hello, Phalcon team. I would like to share with you our success story of using Phalcon in <a href="https://kolesa.kz">kolesa.kz</a> and <a href="https://krisha.kz">krisha.kz</a> projects, the most visited and highloaded sites in Kazakhstan, ranked in TOP-10 classified sites in the CIS. Both sites work on single RESTful-like API written on Phalcon\\Mvc\\Micro. On peak loads API processes something like 400 req/sec and this is not a limit. Moving to Phalcon allowed us to reduce response generation time and the consumption of CPU and RAM, as well as to reduce the time of development process. We will continue using Phalcon in our new projects. Thank you for the great work you are doing!`,
        cite: 'Nikita Vershinin, Lead Developer, Kolesa.kz and krisha.kz',
    },
    {
        html: `I just wanted to share how much I appreciate the work that has gone into cPhalcon. As a lecturer, cPhalcon has given me the opportunity to introduce first-semester students to a broader perspective on web development, beyond the traditional stack that is often limited to XAMPP, PHP, and MySQL. It allows me to show students alternative approaches and modern frameworks while still teaching the fundamentals of programming. For our academic environment, cPhalcon has been very valuable. It helps expand our visibility, enriches the learning experience, and exposes students to technologies they might not otherwise encounter early in their studies. Thank you for maintaining and supporting this project. Its impact extends beyond production systems and reaches classrooms as well.`,
        cite: null
    },
    {
        html: `Phalcon Team, The framework you guys have created is amazing. I've never used a framework that has combined speed, efficiency, brevity, and naturality all in one package. I intend on championing and contributing back to the project in any way that I can. I embarked recently on an ~800 hour project and am happy to say that we are using Phalcon Framework. Bravo.`,
        cite: '',
    },
    {
        html: `Hi guys, I just ran across Phalcon and it's just awesome! I've merely wanted to say to you how awesome you are! So, thanks for this framework and keep up the good work!`,
        cite: 'Ivan Penchev',
    },
    {
        html: `Hi Guys, i wrote simple url-shortener service with phalcon. That was amazing! really. <a href="https://github.com/blackbunny/Url-Shortener">Url-Shortener</a>. Demo is here: u.dolap.co`,
        cite: 'Murat Küçükosman',
    },
    {
        html: `Hello Phalcon Team, I created a small project designed for Polish users using your framework. I have to admit that the performance is amazing, congratulations good job. Service to validate the content of the web pages in Polish language bezbykow.pl`,
        cite: null,
    },
    {
        html: `Hi guys! Just wanted to share with you the latest release of our old project. Switching to phalcon allowed us to halve the server load compared to the previous framework, which is great!`,
        cite: null,
    },
];
