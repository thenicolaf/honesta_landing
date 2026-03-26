--
-- PostgreSQL database dump
--

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.0 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'CANCELLED'
);


--
-- Name: product_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_status AS ENUM (
    'draft',
    'published',
    'archived'
);


--
-- Name: user_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_gender AS ENUM (
    'male',
    'female'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'business',
    'admin'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.benefits (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


--
-- Name: benefits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.benefits_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: benefits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.benefits_id_seq OWNED BY public.benefits.id;


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    audience text,
    tagline text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    badge text
);


--
-- Name: delivery_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.delivery_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    emirate text NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 25 NOT NULL,
    free_delivery_threshold numeric(10,2),
    minimum_order numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    delivery_days integer DEFAULT 1 NOT NULL
);


--
-- Name: free_from_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.free_from_options (
    id integer NOT NULL,
    label text NOT NULL
);


--
-- Name: free_from_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.free_from_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: free_from_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.free_from_options_id_seq OWNED BY public.free_from_options.id;


--
-- Name: notification_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_reads (
    notification_id uuid NOT NULL,
    user_id uuid NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text,
    related_id uuid,
    user_id uuid,
    audience public.user_role,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: occasion_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.occasion_options (
    id integer NOT NULL,
    label text NOT NULL
);


--
-- Name: occasion_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.occasion_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: occasion_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.occasion_options_id_seq OWNED BY public.occasion_options.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    variant_id uuid,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    weight_g integer,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ngenius_ref text,
    status public.order_status DEFAULT 'PENDING'::public.order_status NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 25 NOT NULL,
    total numeric(10,2) NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    coordinates jsonb,
    is_fulfilled boolean DEFAULT false NOT NULL
);


--
-- Name: partnership_inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnership_inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    business_name text NOT NULL,
    contact_name text NOT NULL,
    phone text NOT NULL,
    business_type text,
    message text,
    address text,
    coordinates jsonb
);


--
-- Name: product_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_benefits (
    product_id uuid NOT NULL,
    benefit_id integer NOT NULL
);


--
-- Name: product_free_froms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_free_froms (
    product_id uuid NOT NULL,
    free_from_id integer NOT NULL
);


--
-- Name: product_occasions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_occasions (
    product_id uuid NOT NULL,
    occasion_id integer NOT NULL
);


--
-- Name: product_serving_ideas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_serving_ideas (
    product_id uuid NOT NULL,
    serving_idea_id integer NOT NULL
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_tags (
    product_id uuid NOT NULL,
    tag_id integer NOT NULL
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    weight_g integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category_id uuid,
    slug text NOT NULL,
    title text NOT NULL,
    tagline text,
    image_url text,
    in_stock boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nutrition jsonb,
    status public.product_status DEFAULT 'draft'::public.product_status NOT NULL,
    images jsonb DEFAULT '[]'::jsonb,
    badge text,
    note text
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    first_name text,
    last_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    birthday date,
    gender public.user_gender,
    allow_notifications boolean DEFAULT true NOT NULL
);


--
-- Name: promotion_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotion_products (
    promotion_id uuid NOT NULL,
    product_id uuid NOT NULL
);


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    discount_type text DEFAULT 'percentage'::text NOT NULL,
    discount_value numeric NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT promotions_dates_valid CHECK ((ends_at > starts_at)),
    CONSTRAINT promotions_discount_positive CHECK ((discount_value > (0)::numeric))
);


--
-- Name: serving_idea_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.serving_idea_options (
    id integer NOT NULL,
    label text NOT NULL
);


--
-- Name: serving_idea_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.serving_idea_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: serving_idea_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.serving_idea_options_id_seq OWNED BY public.serving_idea_options.id;


--
-- Name: tag_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_options (
    id integer NOT NULL,
    label text NOT NULL
);


--
-- Name: tag_options_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tag_options_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tag_options_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tag_options_id_seq OWNED BY public.tag_options.id;


--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    label text,
    address text NOT NULL,
    coordinates jsonb,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_favorites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorites (
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: benefits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefits ALTER COLUMN id SET DEFAULT nextval('public.benefits_id_seq'::regclass);


--
-- Name: free_from_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.free_from_options ALTER COLUMN id SET DEFAULT nextval('public.free_from_options_id_seq'::regclass);


--
-- Name: occasion_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occasion_options ALTER COLUMN id SET DEFAULT nextval('public.occasion_options_id_seq'::regclass);


--
-- Name: serving_idea_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serving_idea_options ALTER COLUMN id SET DEFAULT nextval('public.serving_idea_options_id_seq'::regclass);


--
-- Name: tag_options id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_options ALTER COLUMN id SET DEFAULT nextval('public.tag_options_id_seq'::regclass);


--
-- Name: benefits benefits_name_description_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_name_description_key UNIQUE (name, description);


--
-- Name: benefits benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.benefits
    ADD CONSTRAINT benefits_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_user_id_variant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_variant_id_key UNIQUE (user_id, variant_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: delivery_settings delivery_settings_emirate_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_settings
    ADD CONSTRAINT delivery_settings_emirate_key UNIQUE (emirate);


--
-- Name: delivery_settings delivery_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.delivery_settings
    ADD CONSTRAINT delivery_settings_pkey PRIMARY KEY (id);


--
-- Name: free_from_options free_from_options_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.free_from_options
    ADD CONSTRAINT free_from_options_label_key UNIQUE (label);


--
-- Name: free_from_options free_from_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.free_from_options
    ADD CONSTRAINT free_from_options_pkey PRIMARY KEY (id);


--
-- Name: notification_reads notification_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_reads
    ADD CONSTRAINT notification_reads_pkey PRIMARY KEY (notification_id, user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: occasion_options occasion_options_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occasion_options
    ADD CONSTRAINT occasion_options_label_key UNIQUE (label);


--
-- Name: occasion_options occasion_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.occasion_options
    ADD CONSTRAINT occasion_options_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_ngenius_ref_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_ngenius_ref_key UNIQUE (ngenius_ref);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: partnership_inquiries partnership_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_inquiries
    ADD CONSTRAINT partnership_inquiries_pkey PRIMARY KEY (id);


--
-- Name: product_benefits product_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_benefits
    ADD CONSTRAINT product_benefits_pkey PRIMARY KEY (product_id, benefit_id);


--
-- Name: product_free_froms product_free_froms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_free_froms
    ADD CONSTRAINT product_free_froms_pkey PRIMARY KEY (product_id, free_from_id);


--
-- Name: product_occasions product_occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_pkey PRIMARY KEY (product_id, occasion_id);


--
-- Name: product_serving_ideas product_serving_ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serving_ideas
    ADD CONSTRAINT product_serving_ideas_pkey PRIMARY KEY (product_id, serving_idea_id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: promotion_products promotion_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_pkey PRIMARY KEY (promotion_id, product_id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: serving_idea_options serving_idea_options_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serving_idea_options
    ADD CONSTRAINT serving_idea_options_label_key UNIQUE (label);


--
-- Name: serving_idea_options serving_idea_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serving_idea_options
    ADD CONSTRAINT serving_idea_options_pkey PRIMARY KEY (id);


--
-- Name: tag_options tag_options_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_options
    ADD CONSTRAINT tag_options_label_key UNIQUE (label);


--
-- Name: tag_options tag_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_options
    ADD CONSTRAINT tag_options_pkey PRIMARY KEY (id);


--
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- Name: user_favorites user_favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, product_id);


--
-- Name: idx_notifications_audience; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_audience ON public.notifications USING btree (audience);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id) WHERE (user_id IS NOT NULL);


--
-- Name: idx_product_variants_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);


--
-- Name: idx_user_addresses_one_default; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_user_addresses_one_default ON public.user_addresses USING btree (user_id) WHERE (is_default = true);


--
-- Name: idx_user_addresses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_addresses_user_id ON public.user_addresses USING btree (user_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_ngenius_ref_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_ngenius_ref_idx ON public.orders USING btree (ngenius_ref);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_user_id_idx ON public.orders USING btree (user_id);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: notification_reads notification_reads_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_reads
    ADD CONSTRAINT notification_reads_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE;


--
-- Name: notification_reads notification_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_reads
    ADD CONSTRAINT notification_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE SET NULL;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: product_benefits product_benefits_benefit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_benefits
    ADD CONSTRAINT product_benefits_benefit_id_fkey FOREIGN KEY (benefit_id) REFERENCES public.benefits(id) ON DELETE CASCADE;


--
-- Name: product_benefits product_benefits_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_benefits
    ADD CONSTRAINT product_benefits_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_free_froms product_free_froms_free_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_free_froms
    ADD CONSTRAINT product_free_froms_free_from_id_fkey FOREIGN KEY (free_from_id) REFERENCES public.free_from_options(id) ON DELETE CASCADE;


--
-- Name: product_free_froms product_free_froms_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_free_froms
    ADD CONSTRAINT product_free_froms_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_occasions product_occasions_occasion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_occasion_id_fkey FOREIGN KEY (occasion_id) REFERENCES public.occasion_options(id) ON DELETE CASCADE;


--
-- Name: product_occasions product_occasions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_occasions
    ADD CONSTRAINT product_occasions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_serving_ideas product_serving_ideas_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serving_ideas
    ADD CONSTRAINT product_serving_ideas_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_serving_ideas product_serving_ideas_serving_idea_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_serving_ideas
    ADD CONSTRAINT product_serving_ideas_serving_idea_id_fkey FOREIGN KEY (serving_idea_id) REFERENCES public.serving_idea_options(id) ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_tags product_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag_options(id) ON DELETE CASCADE;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: promotion_products promotion_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: promotion_products promotion_products_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.promotion_products
    ADD CONSTRAINT promotion_products_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: user_favorites user_favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorites
    ADD CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: delivery_settings Admin delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin delete" ON public.delivery_settings FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_variants Admin delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin delete" ON public.product_variants FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: order_items Admin delete order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin delete order items" ON public.order_items FOR DELETE TO authenticated USING ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role));


--
-- Name: delivery_settings Admin insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin insert" ON public.delivery_settings FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_variants Admin insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin insert" ON public.product_variants FOR INSERT TO authenticated WITH CHECK ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role));


--
-- Name: delivery_settings Admin update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin update" ON public.delivery_settings FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_variants Admin update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin update" ON public.product_variants FOR UPDATE TO authenticated USING ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role));


--
-- Name: order_items Admin update order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin update order items" ON public.order_items FOR UPDATE TO authenticated USING ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role));


--
-- Name: order_items Admin write order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin write order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK ((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role));


--
-- Name: promotion_products Admins can delete promotion_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete promotion_products" ON public.promotion_products FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: promotions Admins can delete promotions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete promotions" ON public.promotions FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: promotion_products Admins can insert promotion_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert promotion_products" ON public.promotion_products FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: promotions Admins can insert promotions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert promotions" ON public.promotions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: promotions Admins can update promotions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update promotions" ON public.promotions FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: delivery_settings Allow public read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read" ON public.delivery_settings FOR SELECT USING (true);


--
-- Name: promotion_products Anyone can read promotion_products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read promotion_products" ON public.promotion_products FOR SELECT USING (true);


--
-- Name: promotions Anyone can read promotions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read promotions" ON public.promotions FOR SELECT USING (true);


--
-- Name: product_variants Public read access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public read access" ON public.product_variants FOR SELECT USING (true);


--
-- Name: order_items Read order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Read order items" ON public.order_items FOR SELECT TO authenticated USING (((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'admin'::public.user_role) OR (order_id IN ( SELECT orders.id
   FROM public.orders
  WHERE (orders.user_id = auth.uid())))));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_addresses Users delete own addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own addresses" ON public.user_addresses FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_addresses Users insert own addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own addresses" ON public.user_addresses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: cart_items Users manage own cart; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own cart" ON public.cart_items TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- Name: user_favorites Users manage own favorites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own favorites" ON public.user_favorites USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_addresses Users read own addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own addresses" ON public.user_addresses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_addresses Users update own addresses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own addresses" ON public.user_addresses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: benefits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

--
-- Name: benefits benefits_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_delete_admin ON public.benefits FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: benefits benefits_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_insert_admin ON public.benefits FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: benefits benefits_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_select_all ON public.benefits FOR SELECT USING (true);


--
-- Name: benefits benefits_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY benefits_update_admin ON public.benefits FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: cart_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: categories categories_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_delete_admin ON public.categories FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: categories categories_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_insert_admin ON public.categories FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: categories categories_select_public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_select_public ON public.categories FOR SELECT USING (true);


--
-- Name: categories categories_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY categories_update_admin ON public.categories FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: delivery_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: free_from_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.free_from_options ENABLE ROW LEVEL SECURITY;

--
-- Name: free_from_options free_from_options_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY free_from_options_delete_admin ON public.free_from_options FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: free_from_options free_from_options_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY free_from_options_insert_admin ON public.free_from_options FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: free_from_options free_from_options_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY free_from_options_select_all ON public.free_from_options FOR SELECT USING (true);


--
-- Name: free_from_options free_from_options_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY free_from_options_update_admin ON public.free_from_options FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: notification_reads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (((user_id = auth.uid()) OR ((user_id IS NULL) AND ((audience IS NULL) OR (audience = ( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))))));


--
-- Name: occasion_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.occasion_options ENABLE ROW LEVEL SECURITY;

--
-- Name: occasion_options occasion_options_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY occasion_options_delete_admin ON public.occasion_options FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: occasion_options occasion_options_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY occasion_options_insert_admin ON public.occasion_options FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: occasion_options occasion_options_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY occasion_options_select_all ON public.occasion_options FOR SELECT USING (true);


--
-- Name: occasion_options occasion_options_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY occasion_options_update_admin ON public.occasion_options FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: orders orders_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_delete_admin ON public.orders FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: orders orders_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_select ON public.orders FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role))))));


--
-- Name: orders orders_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY orders_update_admin ON public.orders FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: notification_reads own_reads_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY own_reads_insert ON public.notification_reads FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: notification_reads own_reads_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY own_reads_select ON public.notification_reads FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: partnership_inquiries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

--
-- Name: partnership_inquiries partnership_inquiries_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_inquiries_delete_admin ON public.partnership_inquiries FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: partnership_inquiries partnership_inquiries_insert_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_inquiries_insert_all ON public.partnership_inquiries FOR INSERT WITH CHECK (true);


--
-- Name: partnership_inquiries partnership_inquiries_select_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_inquiries_select_admin ON public.partnership_inquiries FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: partnership_inquiries partnership_inquiries_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY partnership_inquiries_update_admin ON public.partnership_inquiries FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_benefits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_benefits ENABLE ROW LEVEL SECURITY;

--
-- Name: product_benefits product_benefits_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_benefits_delete_admin ON public.product_benefits FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_benefits product_benefits_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_benefits_insert_admin ON public.product_benefits FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_benefits product_benefits_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_benefits_select_all ON public.product_benefits FOR SELECT USING (true);


--
-- Name: product_free_froms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_free_froms ENABLE ROW LEVEL SECURITY;

--
-- Name: product_free_froms product_free_froms_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_free_froms_delete_admin ON public.product_free_froms FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_free_froms product_free_froms_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_free_froms_insert_admin ON public.product_free_froms FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_free_froms product_free_froms_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_free_froms_select_all ON public.product_free_froms FOR SELECT USING (true);


--
-- Name: product_occasions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_occasions ENABLE ROW LEVEL SECURITY;

--
-- Name: product_occasions product_occasions_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_occasions_delete_admin ON public.product_occasions FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_occasions product_occasions_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_occasions_insert_admin ON public.product_occasions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_occasions product_occasions_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_occasions_select_all ON public.product_occasions FOR SELECT USING (true);


--
-- Name: product_serving_ideas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_serving_ideas ENABLE ROW LEVEL SECURITY;

--
-- Name: product_serving_ideas product_serving_ideas_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_serving_ideas_delete_admin ON public.product_serving_ideas FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_serving_ideas product_serving_ideas_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_serving_ideas_insert_admin ON public.product_serving_ideas FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_serving_ideas product_serving_ideas_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_serving_ideas_select_all ON public.product_serving_ideas FOR SELECT USING (true);


--
-- Name: product_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: product_tags product_tags_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_tags_delete_admin ON public.product_tags FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_tags product_tags_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_tags_insert_admin ON public.product_tags FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: product_tags product_tags_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY product_tags_select_all ON public.product_tags FOR SELECT USING (true);


--
-- Name: product_variants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_delete_admin ON public.products FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: products products_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_insert_admin ON public.products FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: products products_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_select_all ON public.products FOR SELECT USING (true);


--
-- Name: products products_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY products_update_admin ON public.products FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (((id = auth.uid()) OR public.is_admin()));


--
-- Name: profiles profiles_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (((id = auth.uid()) OR public.is_admin()));


--
-- Name: promotion_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.promotion_products ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: serving_idea_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.serving_idea_options ENABLE ROW LEVEL SECURITY;

--
-- Name: serving_idea_options serving_idea_options_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY serving_idea_options_delete_admin ON public.serving_idea_options FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: serving_idea_options serving_idea_options_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY serving_idea_options_insert_admin ON public.serving_idea_options FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: serving_idea_options serving_idea_options_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY serving_idea_options_select_all ON public.serving_idea_options FOR SELECT USING (true);


--
-- Name: serving_idea_options serving_idea_options_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY serving_idea_options_update_admin ON public.serving_idea_options FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: tag_options; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tag_options ENABLE ROW LEVEL SECURITY;

--
-- Name: tag_options tag_options_delete_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tag_options_delete_admin ON public.tag_options FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: tag_options tag_options_insert_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tag_options_insert_admin ON public.tag_options FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: tag_options tag_options_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tag_options_select_all ON public.tag_options FOR SELECT USING (true);


--
-- Name: tag_options tag_options_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tag_options_update_admin ON public.tag_options FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::public.user_role)))));


--
-- Name: user_addresses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

--
-- Name: user_favorites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

