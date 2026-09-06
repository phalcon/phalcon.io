// Feature-section code panels. One entry per category in the sticky rail.
export interface FeatureCategory {
  key: string;
  title: string;
  tagline: string;
  description: string;
  filename: string;
  lang: 'php' | 'twig';
  code: string;
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    key: 'core',
    title: 'Core',
    tagline: 'Micro · DI · MVC',
    description:
      'A whole app in a handful of lines. The Micro application and the DI container are the same primitives that scale up to a full MVC stack.',
    filename: 'index.php',
    lang: 'php',
    code: `use Phalcon\\Mvc\\Micro;
use Phalcon\\Http\\Response;

$app = new Micro();

$app->get('/hello/{name}', function ($name) {
    return new Response("Hello, {$name}!");
});

$app->handle($_SERVER['REQUEST_URI']);`,
  },
  {
    key: 'database',
    title: 'Database',
    tagline: 'ORM · PHQL · Models',
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
  },
  {
    key: 'frontend',
    title: 'Front End',
    tagline: 'Volt · Forms · Assets',
    description:
      'Volt is a fast, secure templating engine that compiles to plain PHP. Familiar syntax, precompiled once.',
    filename: 'invoices/index.volt',
    lang: 'twig',
    code: `{% for invoice in invoices %}
  <tr>
    <td>{{ invoice.id }}</td>
    <td>{{ invoice.total | number_format(2) }}</td>
    <td>{{ invoice.customer.name }}</td>
  </tr>
{% endfor %}`,
  },
  {
    key: 'business',
    title: 'Business Logic',
    tagline: 'Routing · ACL · Events',
    description:
      'Explicit, readable routing. The router, dispatcher, events manager and ACL are separate services you compose as needed.',
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
  },
  {
    key: 'services',
    title: 'Services',
    tagline: 'Logger · Cache · Config',
    description:
      'Cross-cutting services — logging, caching, config, security — register in the DI container and resolve lazily, once.',
    filename: 'services.php',
    lang: 'php',
    code: `use Phalcon\\Di\\FactoryDefault;
use Phalcon\\Logger\\Logger;
use Phalcon\\Logger\\Adapter\\Stream;

$di = new FactoryDefault();

$di->setShared('logger', function () {
    $adapter = new Stream('php://stderr');
    return new Logger('messages', ['main' => $adapter]);
});`,
  },
];
