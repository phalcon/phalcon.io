/**
 * The code panels of the feature rail on the home page. Each sample runs on
 * v5 and on v6. src/lib/snippets.test.mjs checks the classes, the Volt
 * filters and the docs links.
 *
 * @typedef {{ label: string, slug: string }} Component
 * @typedef {{ key: string, title: string, tagline: string, description: string, filename: string, lang: 'php' | 'twig', code: string, components: Component[] }} FeatureCategory
 */

/** @type {FeatureCategory[]} */
export const FEATURE_CATEGORIES = [
    {
        key: 'core',
        title: 'Core',
        tagline: 'Micro · DI · MVC',
        description:
            'A whole app in a handful of lines. The Micro application and the DI container are the same primitives that scale up to a full MVC stack.',
        filename: 'index.php',
        lang: 'php',
        code: `use Phalcon\\Http\\Response;
use Phalcon\\Mvc\\Micro;

$app = new Micro();

$app->get('/hello/{name}', function ($name) {
    return new Response("Hello, {$name}!");
});

$app->handle($_SERVER['REQUEST_URI']);`,
        components: [
            { label: 'MVC and multi-module', slug: 'mvc' },
            { label: 'Dependency Injection', slug: 'di' },
            { label: 'Micro / REST', slug: 'application-micro' },
            { label: 'Autoloader', slug: 'autoload' },
        ],
    },
    {
        key: 'database',
        title: 'Database',
        tagline: 'ORM · PHQL · Transactions',
        description:
            'Models map to tables, relationships are declarative, and PHQL gives you a database-agnostic query language that compiles to prepared statements.',
        filename: 'Invoices.php',
        lang: 'php',
        code: `use Phalcon\\Mvc\\Model;

class Invoices extends Model
{
    public function initialize(): void
    {
        $this->belongsTo('customerId', Customers::class, 'id');
    }
}

$rows = Invoices::find([
    'conditions' => 'total > :min:',
    'bind'       => ['min' => 1000],
]);`,
        components: [
            { label: 'ORM', slug: 'db-models' },
            { label: 'PHQL', slug: 'db-phql' },
            { label: 'Transactions', slug: 'db-models-transactions' },
            { label: 'Multiple databases', slug: 'db-layer' },
        ],
    },
    {
        key: 'frontend',
        title: 'Front End',
        tagline: 'Volt · Forms · Flash',
        description:
            'Volt is a fast, secure templating engine that compiles to plain PHP. Familiar syntax, compiled once.',
        filename: 'invoices/index.volt',
        lang: 'twig',
        code: `{% for invoice in invoices %}
  <tr>
    <td>{{ invoice.id }}</td>
    <td>{{ '%.2f'|format(invoice.total) }}</td>
    <td>{{ invoice.customer.name|e }}</td>
  </tr>
{% endfor %}`,
        components: [
            { label: 'Volt', slug: 'volt' },
            { label: 'View engines', slug: 'views' },
            { label: 'Forms', slug: 'forms' },
            { label: 'Flash messages', slug: 'flash' },
            { label: 'Translation (i18n)', slug: 'translate' },
        ],
    },
    {
        key: 'business',
        title: 'Business Logic',
        tagline: 'Routing · ACL · Events',
        description:
            'Explicit, readable routing. The router, dispatcher, events manager and ACL are separate services that you compose as needed.',
        filename: 'routes.php',
        lang: 'php',
        code: `use Phalcon\\Mvc\\Router;

$router = new Router(false);

$router->addGet('/invoices', [
    'controller' => 'invoices',
    'action'     => 'index',
]);

$router->addPost('/invoices/create', [
    'controller' => 'invoices',
    'action'     => 'create',
]);`,
        components: [
            { label: 'Router', slug: 'routing' },
            { label: 'ACL', slug: 'acl' },
            { label: 'Events manager', slug: 'events' },
        ],
    },
    {
        key: 'services',
        title: 'Services',
        tagline: 'Cache · Crypt · Logger',
        description:
            'Cross-cutting services (logging, caching, config, security) register in the DI container and resolve lazily, once.',
        filename: 'services.php',
        lang: 'php',
        code: `use Phalcon\\Di\\FactoryDefault;
use Phalcon\\Logger\\Adapter\\Stream;
use Phalcon\\Logger\\Logger;

$di = new FactoryDefault();

$di->setShared('logger', function () {
    $adapter = new Stream('php://stderr');

    return new Logger('messages', ['main' => $adapter]);
});`,
        components: [
            { label: 'Cache', slug: 'cache' },
            { label: 'Encryption', slug: 'encryption-crypt' },
            { label: 'Logger', slug: 'logger' },
            { label: 'Config', slug: 'config' },
        ],
    },
];
