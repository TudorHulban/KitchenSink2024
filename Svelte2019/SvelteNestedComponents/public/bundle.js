
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext$1(key, context) {
        get_current_component().$$.context.set(key, context);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const key = 'userContext';
    const initialValue = null;

    /* src/C1.svelte generated by Svelte v3.12.1 */

    const file = "src/C1.svelte";

    function create_fragment(ctx) {
    	var h2, t0, t1;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text("Variable v1 is ");
    			t1 = text(ctx.v1);
    			add_location(h2, file, 4, 0, 37);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.v1) {
    				set_data_dev(t1, ctx.v1);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { v1 } = $$props;

    	const writable_props = ['v1'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<C1> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('v1' in $$props) $$invalidate('v1', v1 = $$props.v1);
    	};

    	$$self.$capture_state = () => {
    		return { v1 };
    	};

    	$$self.$inject_state = $$props => {
    		if ('v1' in $$props) $$invalidate('v1', v1 = $$props.v1);
    	};

    	return { v1 };
    }

    class C1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["v1"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "C1", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.v1 === undefined && !('v1' in props)) {
    			console.warn("<C1> was created without expected prop 'v1'");
    		}
    	}

    	get v1() {
    		throw new Error("<C1>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set v1(value) {
    		throw new Error("<C1>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Login.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$1 = "src/Login.svelte";

    // (65:30) {:else}
    function create_else_block(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Log in 🔒");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(65:30) {:else}", ctx });
    	return block;
    }

    // (65:2) {#if isLoading}
    function create_if_block(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Logging in...");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(65:2) {#if isLoading}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var form, h1, t1, label0, t3, input0, t4, label1, t6, input1, t7, button, t9, dispose;

    	function select_block_type(changed, ctx) {
    		if (ctx.isLoading) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			form = element("form");
    			h1 = element("h1");
    			h1.textContent = "Login";
    			t1 = space();
    			label0 = element("label");
    			label0.textContent = "CODE";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Password";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Log in";
    			t9 = space();
    			if_block.c();
    			add_location(h1, file$1, 56, 2, 1098);
    			attr_dev(label0, "class", "svelte-aci47a");
    			add_location(label0, file$1, 58, 2, 1116);
    			attr_dev(input0, "name", "logincode");
    			attr_dev(input0, "placeholder", "user code");
    			attr_dev(input0, "class", "svelte-aci47a");
    			add_location(input0, file$1, 59, 2, 1138);
    			attr_dev(label1, "class", "svelte-aci47a");
    			add_location(label1, file$1, 61, 2, 1214);
    			attr_dev(input1, "name", "password");
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "svelte-aci47a");
    			add_location(input1, file$1, 62, 2, 1240);
    			attr_dev(button, "type", "submit");
    			add_location(button, file$1, 63, 2, 1306);
    			attr_dev(form, "class", "svelte-aci47a");
    			add_location(form, file$1, 55, 0, 1049);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h1);
    			append_dev(form, t1);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);

    			set_input_value(input0, ctx.usercode);

    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);

    			set_input_value(input1, ctx.password);

    			append_dev(form, t7);
    			append_dev(form, button);
    			append_dev(form, t9);
    			if_block.m(form, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.usercode && (input0.value !== ctx.usercode)) set_input_value(input0, ctx.usercode);
    			if (changed.password && (input1.value !== ctx.password)) set_input_value(input1, ctx.password);

    			if (current_block_type !== (current_block_type = select_block_type(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(form, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(form);
    			}

    			if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let usercode = "tudi";
      let password = "xxx";
      let isLoading = false;

      let { request } = $$props;

      const handleSubmit = () => {
        $$invalidate('isLoading', isLoading = true);
        console.log("submit:", usercode);

        const bodyFormData = new FormData();
        bodyFormData.set("logincode", usercode);
        bodyFormData.set("password", password);

        let URL = "http://localhost:1323/login";

        request(URL).then(r => {
          setContext(userContextKey, {
            token: r
          });
          console.log("token:", r);
        });
      };

    	const writable_props = ['request'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		usercode = this.value;
    		$$invalidate('usercode', usercode);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	$$self.$set = $$props => {
    		if ('request' in $$props) $$invalidate('request', request = $$props.request);
    	};

    	$$self.$capture_state = () => {
    		return { usercode, password, isLoading, request };
    	};

    	$$self.$inject_state = $$props => {
    		if ('usercode' in $$props) $$invalidate('usercode', usercode = $$props.usercode);
    		if ('password' in $$props) $$invalidate('password', password = $$props.password);
    		if ('isLoading' in $$props) $$invalidate('isLoading', isLoading = $$props.isLoading);
    		if ('request' in $$props) $$invalidate('request', request = $$props.request);
    	};

    	return {
    		usercode,
    		password,
    		isLoading,
    		request,
    		handleSubmit,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["request"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Login", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.request === undefined && !('request' in props)) {
    			console_1.warn("<Login> was created without expected prop 'request'");
    		}
    	}

    	get request() {
    		throw new Error("<Login>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set request(value) {
    		throw new Error("<Login>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/App.svelte";

    function create_fragment$2(ctx) {
    	var h1, t0, t1, t2, t3, t4, current;

    	var login = new Login({ $$inline: true });

    	var c1 = new C1({
    		props: { v1: ctx.thevars.v2 },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Hi ");
    			t1 = text(ctx.name);
    			t2 = text("!");
    			t3 = space();
    			login.$$.fragment.c();
    			t4 = space();
    			c1.$$.fragment.c();
    			attr_dev(h1, "class", "svelte-t9lg13");
    			add_location(h1, file$2, 39, 0, 864);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			insert_dev(target, t3, anchor);
    			mount_component(login, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(c1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.name) {
    				set_data_dev(t1, ctx.name);
    			}

    			var c1_changes = {};
    			if (changed.thevars) c1_changes.v1 = ctx.thevars.v2;
    			c1.$set(c1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);

    			transition_in(c1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			transition_out(c1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    				detach_dev(t3);
    			}

    			destroy_component(login, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			destroy_component(c1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	
      let { name, thevars } = $$props;

      onMount(() => {
        setContext$1(key, initialValue);
      });

    	const writable_props = ['name', 'thevars'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('thevars' in $$props) $$invalidate('thevars', thevars = $$props.thevars);
    	};

    	$$self.$capture_state = () => {
    		return { name, thevars };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('thevars' in $$props) $$invalidate('thevars', thevars = $$props.thevars);
    	};

    	return { name, thevars };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["name", "thevars"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    		if (ctx.thevars === undefined && !('thevars' in props)) {
    			console.warn("<App> was created without expected prop 'thevars'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get thevars() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thevars(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        thevars: {
          v1: 'v1111',
          v2: 'v2222'
        },
        name: 'world'
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
