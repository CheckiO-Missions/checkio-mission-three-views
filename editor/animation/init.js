requirejs(['ext_editor_io2', 'jquery_190', 'raphael_210'],
    function (extIO, $) {
        function three_views_visualization(tgt_node, data) {
            if (!data || !data.ext) {
                return
            }

            /**
             * attr
             */
            const attr = {
                projection_frame: {
                    'stroke-width': '.5px',
                    'stroke': '#294270',
                },
                guid_line: {
                    'stroke-width': '0.2px',
                    'stroke': '#294270',
                },
                header_text: {
                    'font-family': 'times',
                    'font-family': 'Arial',
                    'font-size': '10px',
                },
                view_grid: {
                    'stroke-width': '0.5px',
                    'stroke': '#294270',
                },
                tgt_cell: {
                    'fill': '#FABA00',
                },
                empty_cell: {
                    'fill': '#C9EBFB',
                },
                cube: {
                    dark: {
                        'stroke-width': 0,
                        'fill': '#F0801A',
                    },
                    mid: {
                        'stroke-width': 0,
                        'fill': '#F4A561',
                    },
                    light: {
                        'stroke-width': 0,
                        'fill': '#F7C091',
                    },
                },
                footer_text: {
                    'font-family': 'arial',
                    'font-size': '10px',
                    'text-anchor': 'start',
                },
            }

            /**
             * values
             */
            let input = data.in
            let explanation = data.ext.explanation
            const draw_area_px = 200
            const view_px = 80 
            const unit_px = view_px / 5
            const hex_edge = 41 
            const base = hex_edge * Math.cos(Math.PI * (30/180))
            const height = hex_edge * Math.sin(Math.PI * (30/180))
            const cube_edge = hex_edge / 5
            const cube_height = height / 5
            const cube_base = base / 5
            const au = 'ABCDEFGHIJKLMNOPQRSTUVWXY'

            // paper
            const paper = Raphael(tgt_node, draw_area_px, draw_area_px + 30)
            const cube_set = paper.set()

            /**
             * (func) draw view grid
             */
            function draw_view_grid(sx, sy, header) {
                paper.text(sx + (view_px / 2), sy + view_px + 7, header).attr(attr.header_text)
                const view_grid_dic = {}
                let letter = ''
                for (let y = 0; y < 5; y += 1) {
                    for (let x = 0; x < 5; x += 1) {
                        letter = au[y*5 + x]
                        view_grid_dic[letter] = 
                            paper.rect(sx + x * unit_px, sy + y * unit_px, unit_px, unit_px).attr(attr.view_grid)
                        // letter
                        paper.text(
                            sx + unit_px * (x + .5),
                            sy + unit_px * (y + .5),  
                            letter
                        )
                    }    
                }
                return view_grid_dic
            }

            /**
             * (func) grid painting
             */
            function grid_painting(grid_view_dic, letters) {
                for (let i = 0; i < au.length; i += 1) {
                    if (letters.includes(au[i])) {
                        grid_view_dic[au[i]].attr(attr.tgt_cell)
                    } else {
                        grid_view_dic[au[i]].attr(attr.empty_cell)
                    }
                }
            }

            /**
             * draw view grid
             */
            const front_view_grid_dic = draw_view_grid( 10, 10 + draw_area_px / 2, 'FRONT')
            const right_view_grid_dic = draw_view_grid( 10 + draw_area_px / 2, 10 + draw_area_px / 2, 'RIGHT')
            const top_view_grid_dic = draw_view_grid(10, 10, 'TOP')

            /**
             * (func) view grid painting main
             */
            function grid_painting_main() {
                grid_painting(front_view_grid_dic, input[0])
                grid_painting(right_view_grid_dic, input[1])
                grid_painting(top_view_grid_dic, input[2])
            }

            /**
             * (func) draw cube
             */
            function draw_cube(sx, sy) {
                // front
                cube_set.push(paper.path([
                    'M', sx, sy,
                    'v', -cube_edge,
                    'l', cube_base, cube_height,
                    'v', cube_edge,
                    'z',
                ]).attr(attr.cube.light))
                // top
                cube_set.push(paper.path([
                    'M', sx, sy - cube_edge,
                    'l', cube_base, -cube_height,
                    'l', cube_base, cube_height,
                    'l', -cube_base, cube_height,
                    'z',
                ]).attr(attr.cube.mid))
                // right
                cube_set.push(paper.path([
                    'M', sx + cube_base, sy + cube_height,
                    'v', -cube_edge,
                    'l', cube_base, -cube_height,
                    'v', cube_edge,
                    'z',
                ]).attr(attr.cube.dark))
            }

            /**
             * (func) sort cubes
             */
            function compareFn(a, b) {
                const [a1, a2, a3] = a
                const [b1, b2, b3] = b
                const a0 = a1 * 100 + (4 - a3) * 10 + a2
                const b0 = b1 * 100 + (4 - b3) * 10 + b2
                if (a0 < b0) {
                    return -1
                } else if (a0 > b0) {
                    return 1
                } else {
                    return 0
                }
            }

            /**
             * (func) draw cubes main
             */
            function draw_cubes() {
                explanation.sort(compareFn)
                explanation.forEach(([dx, dy, dz]) => {
                    const ox = draw_area_px * 3 / 4 - base + ((dx + dz) * cube_base)
                    const oy = 10 + height + hex_edge + ((dx - dz) * cube_height) - dy * cube_edge
                    draw_cube(ox, oy)
                })
            }

            /*
             * (func) rotate cube
             */
            function rotate_cubes() {
                const new_explanation = []
                explanation.forEach(([x, y, z]) => {
                    new_explanation.push([z, y, 4-x])
                })
                explanation = new_explanation
            }

            /*
             * (func) clear cube_set
             */
            function clear_cube_set() {
                while (cube_set.length) {
                    cube_set.pop().remove()
                }
            }

            /*
             * (func) rotate_input_letters
             */
            function rotate_input_letters() {
                const [f, r, t] = [new Set(), new Set() ,new Set()]
                explanation.forEach(([x, y, z]) => {
                    f.add(au[x + (4 - y) * 5])
                    r.add(au[z + (4 - y) * 5])
                    t.add(au[x + (4 - z) * 5])
                }); 
                input = [[...f].join(''), [...r].join(''), [...t].join('')]
            }

            /*
             * event onclick
             */
            tgt_node.onclick = () => {
                clear_cube_set()
                rotate_cubes()
                draw_cubes()
                rotate_input_letters()
                grid_painting_main()
            }

            /**
             * draw guid line
             */
            paper.path(['M', 10, 10 + view_px, 'v', 20]).attr(attr.guid_line)
            paper.path(['M', 10 + view_px, 10 + view_px, 'v', 20]).attr(attr.guid_line)
            paper.path(['M', 10 + view_px, 30 + view_px, 'h', 20]).attr(attr.guid_line)
            paper.path(['M', 10 + view_px, 30 + view_px * 2, 'h', 20]).attr(attr.guid_line)

            /**
             * draw outline-frame
             */
            paper.path([
                'M', draw_area_px * 3/4, 10,
                'l', -base, height,
                'v', hex_edge,
                'l', base, -height,
                'v', -hex_edge,
                'l', base, height,
                'v', hex_edge,
                'l', -base, -height,
                'l', -base, height,
                'l', base, height,
                'l', base, -height,
            ]).attr(attr.projection_frame)

            /*
             * init execution
             */
            draw_cubes()
            grid_painting_main()
            paper.text(0, draw_area_px + 15,
                'Click anywhere, rotate the object clockwise.').attr(attr.footer_text)
        }

        var io = new extIO({
            animation: function ($expl, data) {
               three_views_visualization(
                    $expl[0],
                    data,
                );
            }
        });
        io.start();
    }
);
