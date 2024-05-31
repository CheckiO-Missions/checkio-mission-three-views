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
                tgt_grid: {
                    'stroke-width': '0.5px',
                    'stroke': '#294270',
                    'fill': '#FABA00',
                },
                cube: {
                    orange: {
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
                },
            }

            /**
             * values
             */
            const input = data.in
            const explanation = data.ext.explanation
            const draw_area_px = 200
            const os = 13
            const view_px = 80 
            const unit_px = view_px / 5
            const hex_edge = 41 
            const base = hex_edge * Math.cos(Math.PI * (30/180))
            const height = hex_edge * Math.sin(Math.PI * (30/180))
            const cube_edge = hex_edge / 5
            const cube_height = height / 5
            const cube_base = base / 5

            // paper
            const paper = Raphael(tgt_node, draw_area_px + (os * 2), draw_area_px + (os * 2))

            /**
             * (func) draw view grid
             */
            function draw_view_grid(sx, sy, input, header) {
                paper.text(sx + (view_px / 2), sy + view_px + 7, header).attr(attr.header_text)
                const au = 'ABCDEFGHIJKLMNOPQRSTUVWXY'
                for (let i = 0; i < 6; i += 1) {
                    paper.path(['M', sx, sy + i * unit_px, 'h', view_px]).attr(attr.view_grid)
                    paper.path(['M', sx + i * unit_px, sy, 'v', view_px]).attr(attr.view_grid)
                }
                let letter = ''
                for (let i = 0; i < 5; i += 1) {
                    for (let j = 0; j < 5; j += 1) {
                        letter = au[i*5 + j]
                        // tgt_grid
                        if (input.includes(letter)) {
                            paper.rect(
                                sx + j * unit_px,
                                sy + i * unit_px,
                                unit_px, unit_px
                            ).attr(attr.tgt_grid)
                        }
                        // letter
                        paper.text(
                            sx + unit_px * (j + .5),
                            sy + unit_px * (i + .5),  
                            letter
                        )
                    }
                }
            }

            /**
             * draw view grid
             */
            draw_view_grid( os + 10, os + 10 + draw_area_px / 2, input[0], 'FRONT')
            draw_view_grid( os + 10 + draw_area_px / 2, os + 10 + draw_area_px / 2, input[1], 'RIGHT')
            draw_view_grid(os + 10, os + 10, input[2], 'TOP')

            /**
             * draw guid line
             */
            paper.path(['M', os + 10, os + 10 + view_px, 'v', 20]).attr(attr.guid_line)
            paper.path(['M', os + 10 + view_px, os + 10 + view_px, 'v', 20]).attr(attr.guid_line)
            paper.path(['M', os + 10 + view_px, os + 30 + view_px, 'h', 20]).attr(attr.guid_line)
            paper.path(['M', os + 10 + view_px, os + 30 + view_px * 2, 'h', 20]).attr(attr.guid_line)

            /**
             * draw isometric projection
             */
            // outline-frame
            paper.path([
                'M', draw_area_px * 3/4 + os, os + 10,
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

            /**
             * (func) draw cube
             */
            function draw_cube(sx, sy) {
                // front
                paper.path([
                    'M', sx, sy,
                    'v', -cube_edge,
                    'l', cube_base, cube_height,
                    'v', cube_edge,
                    'z',
                ]).attr(attr.cube.orange.light)
                // top
                paper.path([
                    'M', sx, sy - cube_edge,
                    'l', cube_base, -cube_height,
                    'l', cube_base, cube_height,
                    'l', -cube_base, cube_height,
                    'z',
                ]).attr(attr.cube.orange.mid)
                // right
                paper.path([
                    'M', sx + cube_base, sy + cube_height,
                    'v', -cube_edge,
                    'l', cube_base, -cube_height,
                    'v', cube_edge,
                    'z',
                ]).attr(attr.cube.orange.dark)
            }

            /**
             * draw cube
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
            explanation.sort(compareFn)
            explanation.forEach(([dx, dy, dz]) => {
                const ox = draw_area_px * 3 / 4 + os - base + ((dx + dz) * cube_base)
                const oy = os + 10 + height + hex_edge + ((dx - dz) * cube_height) - dy * cube_edge  
                draw_cube(ox, oy)
            })
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
