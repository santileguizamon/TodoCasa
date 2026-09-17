# Diagrama de componentes - TodoCasa

Este diagrama representa la arquitectura general de TodoCasa a nivel academico. No baja al detalle de clases, controladores o metodos internos; agrupa los componentes principales segun su responsabilidad dentro del sistema.

## Diagrama

```mermaid
classDiagram
    package "Usuarios" {
        class Cliente <<actor>>
        class Profesional <<actor>>
        class Administrador <<actor>>
    }

    package "Frontend" {
        class "App Móvil\nExpo / React Native" as MobileApp <<component>>
        class "Panel Administrativo\nNext.js" as AdminPanel <<component>>
    }

    package "Interfaces Frontend" {
        interface IMobileUI
        interface IAdminUI
    }

    package "Interfaces Backend" {
        interface IBackendAPI
        interface IAuthentication
        interface IUserManagement
        interface IDataPersistence
        interface IPaymentProcessing
        interface INotificationDispatch
        interface IGeolocation
        interface IPushNotifications
    }

    package "Backend API - NestJS" {
        class AppModule <<component>>
        class Controllers <<component>>
        class Gateways <<component>>
        class Guards <<component>>
        class DTO <<component>>

        class AuthService <<component>>
        class UsersService <<component>>
        class ProfessionalsService <<component>>
        class SpecialtiesService <<component>>
        class VerificationService <<component>>
        class JobsService <<component>>
        class OffersService <<component>>
        class ReviewsService <<component>>
        class ChatService <<component>>
        class MessagesService <<component>>
        class NotificationsService <<component>>
        class PaymentsService <<component>>
        class SubscriptionsService <<component>>
        class AdminModule <<component>>
        class PrismaService <<component>>
        class CronTasks <<component>>
    }

    package "Persistencia" {
        class PostgreSQL <<database>>
        class PrismaSchema <<artifact>>
    }

    package "Servicios externos" {
        class MercadoPago <<component>>
        class GeoService <<component>>
        class PushService <<component>>
    }

    Cliente --> MobileApp : usa
    Profesional --> MobileApp : usa
    Administrador --> AdminPanel : usa

    MobileApp ..> IMobileUI : requiere UI
    AdminPanel ..> IAdminUI : requiere UI
    IMobileUI <|.. MobileApp : provee UI
    IAdminUI <|.. AdminPanel : provee UI

    MobileApp ..> IBackendAPI : requiere servicios
    AdminPanel ..> IBackendAPI : requiere servicios
    MobileApp ..> IGeolocation : requiere geocodificacion

    Controllers ..|> IBackendAPI : proporciona
    AuthService ..|> IAuthentication : proporciona
    UsersService ..|> IUserManagement : proporciona
    PrismaService ..|> IDataPersistence : proporciona
    PaymentsService ..|> IPaymentProcessing : proporciona
    NotificationsService ..|> INotificationDispatch : proporciona
    GeoService ..|> IGeolocation : proporciona
    PushService ..|> IPushNotifications : proporciona

    NotificationsService ..> IPushNotifications : requiere envio push
    PaymentsService ..> IPaymentProcessing : requiere pago externo

    note right of IBackendAPI : Interfaz requerida por MobileApp y AdminPanel
    note right of IGeolocation : Interfaz requerida por App Móvil
    note right of IPaymentProcessing : Interfaz requerida por PaymentsService
    note right of IPushNotifications : Interfaz requerida por NotificationsService

    Controllers --> Guards : protege
    Controllers --> DTO : valida datos
    Controllers --> AuthService : delega auth
    Controllers --> UsersService : maneja usuarios
    Controllers --> ProfessionalsService : maneja profesionales
    Controllers --> SpecialtiesService : maneja especialidades
    Controllers --> VerificationService : maneja verificacion
    Controllers --> JobsService : gestiona trabajos
    Controllers --> OffersService : gestiona ofertas
    Controllers --> ReviewsService : gestiona valoraciones
    Controllers --> ChatService : gestiona chat
    Controllers --> MessagesService : gestiona mensajes
    Controllers --> NotificationsService : gestiona notificaciones
    Controllers --> PaymentsService : gestiona pagos
    Controllers --> SubscriptionsService : gestiona suscripciones

    Gateways --> ChatService : enruta chat
    Gateways --> MessagesService : enruta mensajes
    Gateways --> IBackendAPI : expone WebSocket

    AppModule --> Controllers
    AppModule --> Gateways
    AppModule --> AuthService
    AppModule --> UsersService
    AppModule --> ProfessionalsService
    AppModule --> SpecialtiesService
    AppModule --> VerificationService
    AppModule --> JobsService
    AppModule --> OffersService
    AppModule --> ReviewsService
    AppModule --> ChatService
    AppModule --> MessagesService
    AppModule --> NotificationsService
    AppModule --> PaymentsService
    AppModule --> SubscriptionsService
    AppModule --> AdminModule
    AppModule --> PrismaService

    PrismaService --> PrismaSchema
    PrismaSchema --> PostgreSQL

    PaymentsService --> MercadoPago : integra pagos
    NotificationsService --> PushService : envia avisos
```

## Elementos a usar en el diagrama

- **Actores:** Cliente, Profesional y Administrador.
- **Componentes de presentacion:** aplicacion movil Expo/React Native y panel administrativo Next.js.
- **Componentes de entrada del backend:** controllers REST, gateways WebSocket y guards de autenticacion/autorizacion.
- **Componentes funcionales del backend:** Auth, Usuarios, Profesionales, Trabajos, Ofertas, Chat/Mensajes, Pagos/Suscripciones, Notificaciones, Valoraciones, Verificacion y Administracion.
- **Componentes de soporte:** AppModule, tareas programadas y PrismaService.
- **Base de datos:** PostgreSQL.
- **Servicios externos:** Mercado Pago, servicio de geocodificacion y servicio de notificaciones push.

## Componentes principales

- **Aplicacion movil:** interfaz principal para clientes y profesionales. Permite registrarse, iniciar sesion, publicar trabajos, realizar ofertas, chatear, pagar, recibir notificaciones y valorar trabajos.
- **Panel administrativo:** interfaz web destinada a usuarios administradores. Consume endpoints del backend para consultar y gestionar informacion del sistema.
- **Backend API:** concentra la logica de negocio. Esta organizado en modulos NestJS segun las funcionalidades principales de la aplicacion.
- **Modulo de autenticacion:** gestiona login, roles, tokens JWT y proteccion de rutas.
- **Modulos de dominio:** usuarios, profesionales, especialidades, trabajos, ofertas, chat, mensajes, pagos, suscripciones, notificaciones, valoraciones y verificaciones.
- **Modulo de persistencia:** encapsula el acceso a datos mediante Prisma ORM.
- **Base de datos PostgreSQL:** almacena usuarios, profesionales, trabajos, ofertas, chats, mensajes, pagos, suscripciones, valoraciones, notificaciones y verificaciones.
- **Servicios externos:** representan dependencias fuera del sistema, como Mercado Pago, geocodificacion y notificaciones push.

## Alcance academico

El diagrama muestra una vista general de componentes y dependencias. Para mantenerlo legible, no se representan:

- DTOs, entidades internas ni guards especificos.
- Metodos de controladores o servicios.
- Cada endpoint REST individual.
- Cada tabla o relacion de la base de datos.
- Detalles de infraestructura, despliegue o balanceo de carga.

Esta abstraccion es adecuada para explicar la arquitectura del sistema, sus capas principales y la comunicacion entre frontend, backend, base de datos y servicios externos.
