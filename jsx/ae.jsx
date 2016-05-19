function renderSequence(presetPath, outputPath) {
    
    //app.enableQE();
    var jobID = undefined;

    var activeSequence = app.project.activeItem;
    if (activeSequence != undefined) {

        app.project.renderQueue.items.add(activeSequence);

        var file = new File(calculateOutputFilename(outputPath, activeSequence, "avi"));//todo change this to prefix of video

        app.project.renderQueue.item(1).outputModule(1).file = file;

        // app.project.renderQueue.item(1).outputModule(1).file = app.project.file; outputPath
        //app.project.renderQueue.item(1).applyTemplate("MY SETTINGS");
        // app.project.renderQueue.item(1).outputModules[1].applyTemplate("MY SETTINGS");
        // app.executeCommand(3800); //Add to media encodre queue
        app.project.save();
         app.project.renderQueue.render(); //Triggers render inside AE.
         return outputPath + activeSequence.name + ".avi";
        //$.writeln("status: ", app.project.renderQueue.item(1).status);
        //$.writeln("RQItemStatus.RENDERING: ", RQItemStatus.RENDERING);
        //$.writeln("RQItemStatus.DONE: ", RQItemStatus.DONE);
        //$.writeln("RQItemStatus.QUEUED: ", RQItemStatus.QUEUED);

    }

    return null;
}

function setCurrentTimeIndicator(time) {
    app.project.activeItem.time = time
}

function setCompMarkers(data) {

    //var json;

    //if (typeof JSON !== 'object') {
    //    json = Function("return " + data + "")();
    //} else {
    //    json = JSON.parse(data);
    //}
    //JSON.stringify(app.project.activeItem.layers[1])
    //var markers = app.project.activeItem.layers[1].property("marker");

    ////$.writeln("markers.numKeys: ", markers.numKeys)
    //for (var i = 1; i < markers.numKeys; i++)
    //{
    //    var myMarker = markers.keyValue(i);
    //    $.writeln("marker: " + i + " ", myMarker.comment);
    //}

    //$.writeln("time before: ", app.project.activeItem.time);
   // JSON.stringify(app.project.activeItem);

   // app.project.activeItem.time = 65.7650984317651
    //AEGP_SetItemCurrentTime 
    //$.writeln("time after: ", app.project.activeItem.time);
    ////working
    //for (var i = 0; i < json.length; i++) {
    //    var myMarker = new MarkerValue(json[i].comments);
    //    app.project.activeItem.layers[1].property("Marker").setValueAtTime(json[i].start, myMarker);
    //}

  //  return json;

}

function removeZValue(frames) {
    for (var i = 0; i < frames.length; i++) frames[i].v.length > 2 && frames[i].v.pop();
    return frames;
}

function removeValues(frames, index) {
    for (var i = 0; i < frames.length; i++) frames[i].v.splice(index);
    return frames;
}

function roundValue(frames, prcsn) {
    for (var precision = prcsn || 1, i = 0; i < frames.length; i++) if (frames[i].v instanceof Array) for (var j = 0; j < frames[i].v.length; j++) frames[i].v[j] = Math.round(frames[i].v[j] * precision) / precision; else frames[i].v = Math.round(frames[i].v * precision) / precision;
    return frames;
}

function divideValue(frames, divider) {
    for (var i = 0; i < frames.length; i++) if (frames[i].v instanceof Array) for (var j = 0; j < frames[i].v.length; j++) frames[i].v[j] = frames[i].v[j] / divider; else frames[i].v = frames[i].v / divider;
    return frames;
}

function multiplyValue(frames, multiplier) {
    for (var i = 0; i < frames.length; i++) if (frames[i].v instanceof Array) for (var j = 0; j < frames[i].v.length; j++) frames[i].v[j] = frames[i].v[j] * multiplier; else frames[i].v = frames[i].v * multiplier;
    return frames;
}

function clampValue(frames, from, to) {
    for (var i = 0; i < frames.length; i++) if (frames[i].v instanceof Array) for (var j = 0; j < frames[i].v.length; j++) frames[i].v[j] > to ? frames[i].v[j] = to : frames[i].v[j] < from && (frames[i].v[j] = from); else frames[i].v > to ? frames[i].v = to : frames[i].v < from && (frames[i].v = from);
    return frames;
}

function getArcLength(path) {
    for (var steps = 100, t = 1 / steps, aX = 0, aY = 0, bX = path[0], bY = path[1], dX = 0, dY = 0, dS = 0, sumArc = 0, j = 0, i = 0; steps > i; j += t) aX = cubicN(j, path[0], path[2], path[4], path[6]),
    aY = cubicN(j, path[1], path[3], path[5], path[7]), dX = aX - bX, dY = aY - bY,
    dS = Math.sqrt(dX * dX + dY * dY), sumArc += dS, bX = aX, bY = aY, i++;
    return sumArc;
}

function cubicN(pct, a, b, c, d) {
    var t2 = pct * pct, t3 = t2 * pct;
    return a + (3 * -a + pct * (3 * a - a * pct)) * pct + (3 * b + pct * (-6 * b + 3 * b * pct)) * pct + (3 * c - 3 * c * pct) * t2 + d * t3;
}

function getValueDifference(lastKey, key) {
    var x, y, z, diff;
    return key.v instanceof Array && key.v.length > 2 ? (x = key.v[0] - lastKey.v[0],
    y = key.v[1] - lastKey.v[1], z = key.v[2] - lastKey.v[2], diff = Math.pow(x * x + y * y + z * z, 1 / 3)) : key.v instanceof Array && 2 === key.v.length ? (x = key.v[0] - lastKey.v[0],
    y = key.v[1] - lastKey.v[1], diff = Math.sqrt(x * x + y * y)) : diff = key.v - lastKey.v,
    diff;
}

function dist2d(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function printObj(obj) {
   // $.writeln("-----------------------");
    for (var key in obj) obj.hasOwnProperty(key) && ("function" == typeof obj[key] ? $.writeln(key + ": function") : $.writeln(key + ": " + obj[key]));
    //$.writeln("-----------------------");
}

function reflectObj(obj) {
    for (var props = obj.reflect.properties, i = 0; i < props.length; i++) $.writeln(props[i].name + ": " + f[props[i].name]);
}

function isEmpty(obj) {
    for (var prop in obj) if (obj.hasOwnProperty(prop)) return !1;
    return !0;
}

function clearConsole() {
    var bt = new BridgeTalk();
    bt.target = "estoolkit-4.0", bt.body = function () {
        app.clc();
    }.toSource() + "()", bt.send(5);
}

function normalizeKeyframes(frames) {
    for (var i = 1; i < frames.length; i++) {
        var diff, easeOut, easeIn, normInfluenceIn, normSpeedIn, normInfluenceOut, normSpeedOut, lastKey = frames[i - 1], key = frames[i], duration = key.t - lastKey.t;
        if (lastKey.outType !== KeyframeInterpolationType.LINEAR || key.inType !== KeyframeInterpolationType.LINEAR) {
            diff = lastKey.len ? lastKey.len : getValueDifference(lastKey, key);
            var sign = 1;
            if (.01 > diff && diff > -.01) {
                if (diff = .01, key.v instanceof Array) for (var j = 0; j < key.v.length; j++) key.v[j] = lastKey.v[j] + .01 * sign; else key.v = lastKey.v + .01 * sign;
                sign = -1 * sign;
            }
            var averageTempo = diff / duration * 1e3;
            key.easeIn && (normInfluenceIn = key.easeIn[0] / 100, normSpeedIn = key.easeIn[1] / averageTempo * normInfluenceIn,
            easeIn = [], easeIn[0] = Math.round(1e3 * (1 - normInfluenceIn)) / 1e3, easeIn[1] = Math.round(1e3 * (1 - normSpeedIn)) / 1e3,
            key.easeIn = easeIn), lastKey.easeOut && (normInfluenceOut = lastKey.easeOut[0] / 100,
            normSpeedOut = lastKey.easeOut[1] / averageTempo * normInfluenceOut, easeOut = [],
            easeOut[0] = Math.round(1e3 * normInfluenceOut) / 1e3, easeOut[1] = Math.round(1e3 * normSpeedOut) / 1e3,
            lastKey.easeOut = easeOut), lastKey.easeOut && !key.easeIn ? key.easeIn = [.16667, 1] : key.easeIn && !lastKey.easeOut && (lastKey.easeOut = [.16667, 0]),
            lastKey.easeOut[0] === lastKey.easeOut[1] && key.easeIn[0] === key.easeIn[1] && (delete lastKey.easeOut,
            delete key.easeIn), key.inType && delete key.inType, key.outType && delete key.outType,
            key.inTangent && delete key.inTangent, key.outTangent && delete key.outTangent,
            lastKey.inType && delete lastKey.inType, lastKey.outType && delete lastKey.outType,
            lastKey.inTangent && delete lastKey.inTangent, lastKey.outTangent && delete lastKey.outTangent;
        } else delete lastKey.outType, delete lastKey.easeOut, delete lastKey.outTangent,
        delete key.inType, delete key.easeIn, delete key.inTangent;
    }
    return frames;
}

function getMotionpath(frames) {
    function isCurved(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY) {
        var threshold = 5;
        return distanceToLine(startX, startY, endX, endY, ctrl1X, ctrl1Y) > threshold || distanceToLine(startX, startY, endX, endY, ctrl2X, ctrl2Y) > threshold;
    }
    function distanceToLine(startX, startY, endX, endY, ctrlX, ctrlY) {
        var m = (endY - startY) / (endX - startX), b = startY - m * startX, pX = (m * ctrlY + ctrlX - m * b) / (m * m + 1), pY = (m * m * ctrlY + m * ctrlX + b) / (m * m + 1);
        return dist2d(pX, pY, startX, startY) > dist2d(startX, startY, endX, endY) || dist2d(pX, pY, endX, endY) > dist2d(startX, startY, endX, endY) ? 1 / 0 : dist2d(pX, pY, ctrlX, ctrlY);
    }
    for (var i = 1; i < frames.length; i++) {
        var lastKey = frames[i - 1], key = frames[i];
        if (lastKey && key) {
            var startX = lastKey.v[0], startY = lastKey.v[1], ctrl1X = lastKey.outTangent[0] + lastKey.v[0], ctrl1Y = lastKey.outTangent[1] + lastKey.v[1], ctrl2X = key.inTangent[0] + key.v[0], ctrl2Y = key.inTangent[1] + key.v[1], endX = key.v[0], endY = key.v[1];
            isCurved(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY) && (lastKey.motionpath = [startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY],
            lastKey.len = getArcLength(lastKey.motionpath));
        }
    }
    return frames;
}

function getTransform(data) {
    var transform = {};
    return getAnchor(data, transform), getPosition(data, transform), getScale(data, transform),
    getSkew(data, transform), getSkewAxis(data, transform), getRotation(data, transform),
    getOpacity(data, transform), transform;
}

function getAnchor(data, transform) {
    var obj;
    if (data.property("ADBE Anchor Point") instanceof Property) obj = data.property("ADBE Anchor Point"); else {
        if (!(data.property("ADBE Vector Anchor") instanceof Property)) return null;
        obj = data.property("ADBE Vector Anchor");
    }
    if (obj.isTimeVarying || 0 !== obj.value[0] || 0 !== obj.value[1]) {
        var anchor = getProperty(obj);
        anchor = removeZValue(anchor), anchor = roundValue(anchor), anchor = normalizeKeyframes(anchor),
        transform.anchor = anchor;
    }
}

function getScale(data, transform) {
    var obj;
    if (data.property("ADBE Scale") instanceof Property) obj = data.property("ADBE Scale"); else {
        if (!(data.property("ADBE Vector Scale") instanceof Property)) return null;
        obj = data.property("ADBE Vector Scale");
    }
    if (obj.isTimeVarying || 100 !== obj.value[0] || 100 !== obj.value[1]) {
        var scaleX = getProperty(obj, 0);
        scaleX = normalizeKeyframes(scaleX), scaleX = divideValue(scaleX, 100), scaleX = roundValue(scaleX, 1e4);
        var scaleY = getProperty(obj, 1);
        scaleY = normalizeKeyframes(scaleY), scaleY = divideValue(scaleY, 100), scaleY = roundValue(scaleY, 1e4),
        transform.scaleX = scaleX, transform.scaleY = scaleY;
    }
}

function getPosition(data, transform) {
    var obj;
    if (data.property("ADBE Position") instanceof Property) obj = data.property("ADBE Position"); else {
        if (!(data.property("ADBE Vector Position") instanceof Property)) return null;
        obj = data.property("ADBE Vector Position");
    }
    if (obj.isTimeVarying || 0 !== obj.value[0] || 0 !== obj.value[1]) {
        var position = getProperty(obj);
        position = removeZValue(position), position = roundValue(position), position.length > 1 && (position = getMotionpath(position),
        position = normalizeKeyframes(position)), transform.position = position;
    }
}

function getRotation(data, transform) {
    var obj;
    if (data.property("ADBE Rotate Z") instanceof Property) obj = data.property("ADBE Rotate Z"); else {
        if (!(data.property("ADBE Vector Rotation") instanceof Property)) return null;
        obj = data.property("ADBE Vector Rotation");
    }
    if (obj.isTimeVarying || 0 !== obj.value) {
        var rotation = getProperty(obj);
        rotation = roundValue(rotation, 1e4), rotation.length > 1 && (rotation = normalizeKeyframes(rotation)),
        transform.rotation = rotation;
    }
}

function getOpacity(data, transform) {
    var obj;
    if (data.property("ADBE Opacity") instanceof Property) obj = data.property("ADBE Opacity"); else {
        if (!(data.property("ADBE Vector Group Opacity") instanceof Property)) return null;
        obj = data.property("ADBE Vector Group Opacity");
    }
    if (obj.isTimeVarying || 100 !== obj.value) {
        var opacity = getProperty(obj);
        opacity = normalizeKeyframes(opacity), opacity = divideValue(opacity, 100), transform.opacity = opacity;
    }
}

function getSkew(data, transform) {
    var obj;
    if (!(data.property("ADBE Vector Skew") instanceof Property)) return null;
    if (obj = data.property("ADBE Vector Skew"), obj && obj.isTimeVarying || obj && 0 !== obj.value) {
        var skew = getProperty(obj);
        skew.length > 1 && (skew = normalizeKeyframes(skew)), transform.skew = skew;
    }
}

function getSkewAxis(data, transform) {
    var obj;
    if (!(data.property("ADBE Vector Skew Axis") instanceof Property)) return null;
    if (obj = data.property("ADBE Vector Skew Axis"), obj && obj.isTimeVarying || obj && 0 !== obj.value) {
        var skewAxis = getProperty(obj);
        skewAxis = normalizeKeyframes(skewAxis), transform.skewAxis = skewAxis;
    }
}

function getComp(data) {
    function getCompMarkers(data) {
        var markers = [], tempNull = data.layers.addNull(data.duration), tempPos = tempNull.property("ADBE Transform Group").property("ADBE Position");
        tempPos.expression = "x = thisComp.marker.numKeys;[x,0];";
        for (var result = tempPos.value[0], i = 1; result >= i; i++) {
            var tempText = data.layers.addText(), pos = tempText.property("ADBE Transform Group").property("ADBE Position");
            pos.expression = "[thisComp.marker.key(" + i + ").time,0];", tempText.property("ADBE Text Properties").property("ADBE Text Document").expression = "thisComp.marker.key(" + i + ").comment;";
            var comment = tempText.property("ADBE Text Properties").property("ADBE Text Document").value.text, time = 1e3 * tempText.property("ADBE Transform Group").property("ADBE Position").value[0];
            comment = comment.replace(/(\r\n|\n|\r)/gm, " "), time = Math.round(time), tempText.remove(),
            markers.push({
                comment: comment, 
                time: time,
                stop: comment.toLocaleLowerCase().indexOf("stop") > -1
            });
        }
        return tempNull.source.remove(), markers;
    }
    var comp = {};
    comp.layers = [], comp.duration = 1e3 * data.duration, comp.width = data.width,
    comp.height = data.height, comp.markers = getCompMarkers(data);
    for (var i = data.numLayers; i > 0; i--) {
        var layer = data.layer(i);
        layer instanceof ShapeLayer && layer.enabled ? comp.layers.push(getGroup(layer)) : layer instanceof AVLayer && layer.enabled && comp.layers.push(getImage(layer));
    }
    return comp;
}

function getGroup(data) {
    function optimizeGroup(group) {
        return group.merge && group.groups && (group = removeFillAndStrokeIfMerge(group)),
        group;
    }
    function removeFillAndStrokeIfMerge(group) {
        for (var i = 0; i < group.groups.length; i++) group.groups[i].fill && delete group.groups[i].fill,
        group.groups[i].stroke && delete group.groups[i].stroke, group.groups[i].groups && (group.groups[i] = removeFillAndStrokeIfMerge(group.groups[i]));
        return group;
    }
    var group = {};
    data.inPoint && (group["in"] = Math.round(1e3 * data.inPoint)), data.outPoint && (group.out = Math.round(1e3 * data.outPoint)),
    "undefined" != typeof group["in"] && group["in"] < 0 && (group["in"] = 0), group.type = "vector";
    for (var i = 1; i <= data.numProperties; i++) {
        var prop = data.property(i), matchName = prop.matchName;
        if (prop.enabled) switch (matchName) {
            case "ADBE Vector Blend Mode":
                break;

            case "ADBE Transform Group":
            case "ADBE Vector Transform Group":
                group.transform = getTransform(prop);
                break;

            case "ADBE Vector Materials Group":
                break;

            case "ADBE Root Vectors Group":
            case "ADBE Vectors Group":
                for (var j = 1; j <= prop.numProperties; j++) {
                    var innerProp = prop.property(j), innerMatchName = innerProp.matchName;
                    if (innerProp.enabled) switch (innerMatchName) {
                        case "ADBE Vector Group":
                            group.groups || (group.groups = []), group.groups.unshift(getGroup(innerProp));
                            break;

                        case "ADBE Vector Shape - Group":
                            group.shapes || (group.shapes = []), group.shapes.unshift(getPath(innerProp));
                            break;

                        case "ADBE Vector Shape - Rect":
                            group.shapes || (group.shapes = []), group.shapes.unshift(getRect(innerProp));
                            break;

                        case "ADBE Vector Shape - Ellipse":
                            group.shapes || (group.shapes = []), group.shapes.unshift(getEllipse(innerProp));
                            break;

                        case "ADBE Vector Shape - Star":
                            group.shapes || (group.shapes = []), group.shapes.unshift(getPolystar(innerProp));
                            break;

                        case "ADBE Vector Graphic - Fill":
                            group.fill || (group.fill = getFill(innerProp));
                            break;

                        case "ADBE Vector Graphic - G-Fill":
                            break;

                        case "ADBE Vector Graphic - Stroke":
                            group.stroke || (group.stroke = getStroke(innerProp));
                            break;

                        case "ADBE Vector Filter - Merge":
                            group.merge = getMerge(innerProp);
                            break;

                        case "ADBE Vector Filter - Trim":
                            group.trim = getVectorTrim(innerProp);
                    }
                }
        }
    }
    return optimizeGroup(group);
}

function getImage(data) {
    var image = {};
    data.inPoint && (image["in"] = Math.round(1e3 * data.inPoint)), data.outPoint && (image.out = Math.round(1e3 * data.outPoint)),
    "undefined" != typeof image["in"] && image["in"] < 0 && (image["in"] = 0), image.source = data.source.name,
    image.type = "image";
    for (var i = 1; i <= data.numProperties; i++) {
        var prop = data.property(i), matchName = prop.matchName;
        if (prop.enabled) switch (matchName) {
            case "ADBE Transform Group":
                image.transform = getTransform(prop);
        }
    }
    return image;
}

function getPath(data) {
    function getPoint(pointData) {
        for (var vertices = [], i = 0; i < pointData.vertices.length; i++) {
            var x = pointData.vertices[i][0], y = pointData.vertices[i][1], outX = x + pointData.outTangents[i][0], outY = y + pointData.outTangents[i][1], inX = x + pointData.inTangents[i][0], inY = y + pointData.inTangents[i][1], vertex = [outX, outY, inX, inY, x, y];
            vertices.push(vertex);
        }
        return vertices;
    }
    function getTotalLength(frames) {
        for (var i = 0; i < frames.length; i++) {
            frames[i].len = [];
            for (var j = 1; j < frames[i].v.length; j++) {
                var path, point = frames[i].v[j], lastPoint = frames[i].v[j - 1];
                if (lastPoint && point) {
                    var startX = lastPoint[4], startY = lastPoint[5], ctrl1X = lastPoint[0], ctrl1Y = lastPoint[1], ctrl2X = point[2], ctrl2Y = point[3], endX = point[4], endY = point[5];
                    path = [startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY], frames[i].len.push(getArcLength(path));
                }
            }
        }
        return frames;
    }
    function normalizePathKeyframes(frames) {
        for (var i = 1; i < frames.length; i++) {
            var key = frames[i], lastKey = frames[i - 1];
            lastKey.easeOut && !key.easeIn ? key.easeIn = [.16667, 1] : key.easeIn && !lastKey.easeOut && (lastKey.easeOut = [.16667, 0]);
        }
        return frames;
    }
    var data = data.property("ADBE Vector Shape"), path = {};
    path.type = "path", path.closed = data.value.closed, path.frames = [];
    var numKeys = data.numKeys;
    if (numKeys > 1) {
        path.isAnimated = !0;
        for (var i = 1; numKeys >= i; i++) {
            var obj = {}, inType = data.keyInInterpolationType(i), outType = data.keyOutInterpolationType(i);
            if (obj.v = getPoint(data.keyValue(i)), obj.t = Math.round(1e3 * data.keyTime(i)),
            i > 1 && inType === KeyframeInterpolationType.BEZIER) {
                var easeIn = data.keyInTemporalEase(i)[0];
                obj.easeIn = [], obj.easeIn[0] = 1 - easeIn.influence / 100, obj.easeIn[1] = 1 - Math.round(1e4 * easeIn.speed) / 1e4;
            }
            if (numKeys > i && outType === KeyframeInterpolationType.BEZIER) {
                var easeOut = data.keyOutTemporalEase(i)[0];
                obj.easeOut = [], obj.easeOut[0] = easeOut.influence / 100, obj.easeOut[1] = Math.round(1e4 * easeOut.speed) / 1e4;
            }
            path.frames.push(obj);
        }
        path.frames = normalizePathKeyframes(path.frames);
    } else {
        var obj = {};
        path.isAnimated = !1, obj.t = 0, obj.v = getPoint(data.value), path.frames.push(obj);
    }
    return path.frames = getTotalLength(path.frames), path;
}

function getRect(data) {
    var rect = {};
    rect.type = "rect", rect.size = getProperty(data.property("ADBE Vector Rect Size")),
    rect.size = roundValue(rect.size), rect.size = normalizeKeyframes(rect.size);
    var position = data.property("ADBE Vector Rect Position");
    (position.isTimeVarying || 0 !== position.value[0] || 0 !== position.value[1]) && (position = getProperty(position),
    position = normalizeKeyframes(position), rect.position = position);
    var roundness = data.property("ADBE Vector Rect Roundness");
    return (roundness.isTimeVarying || 0 !== roundness.value) && (roundness = getProperty(roundness),
    roundness = normalizeKeyframes(roundness), rect.roundness = roundness), rect;
}

function getEllipse(data) {
    var ellipse = {};
    ellipse.type = "ellipse", ellipse.size = getProperty(data.property("ADBE Vector Ellipse Size")),
    ellipse.size = normalizeKeyframes(ellipse.size);
    var position = data.property("ADBE Vector Ellipse Position");
    return (position.isTimeVarying || 0 !== position.value[0] || 0 !== position.value[1]) && (ellipse.position = getProperty(position),
    ellipse.position = normalizeKeyframes(ellipse.position)), ellipse;
}

function getPolystar(data) {
    var polystar = {};
    polystar.type = "polystar", polystar.starType = data.property("ADBE Vector Star Type").value,
    polystar.points = getProperty(data.property("ADBE Vector Star Points")), polystar.points = normalizeKeyframes(polystar.points),
    polystar.outerRadius = getProperty(data.property("ADBE Vector Star Outer Radius")),
    polystar.outerRadius = normalizeKeyframes(polystar.outerRadius), polystar.innerRadius = getProperty(data.property("ADBE Vector Star Inner Radius")),
    polystar.innerRadius = normalizeKeyframes(polystar.innerRadius);
    var position = data.property("ADBE Vector Star Position");
    (position.isTimeVarying || 0 !== position.value[0] || 0 !== position.value[1]) && (polystar.position = getProperty(position),
    polystar.position = normalizeKeyframes(polystar.position));
    var rotation = data.property("ADBE Vector Star Rotation");
    (rotation.isTimeVarying || 0 !== rotation.value) && (polystar.rotation = getProperty(rotation),
    polystar.rotation = normalizeKeyframes(polystar.rotation));
    var innerRoundness = data.property("ADBE Vector Star Inner Roundess");
    (innerRoundness.isTimeVarying || 0 !== innerRoundness.value) && (polystar.innerRoundness = getProperty(innerRoundness),
    polystar.innerRoundness = normalizeKeyframes(polystar.innerRoundness));
    var outerRoundness = data.property("ADBE Vector Star Outer Roundess");
    return (outerRoundness.isTimeVarying || 0 !== outerRoundness.value) && (polystar.outerRoundness = getProperty(outerRoundness),
    polystar.outerRoundness = normalizeKeyframes(polystar.outerRoundness)), polystar;
}

function getFill(data) {
    var fill = {};
    fill.color = getProperty(data.property("ADBE Vector Fill Color")), fill.color = removeValues(fill.color, 3),
    fill.color = multiplyValue(fill.color, 255), fill.color = roundValue(fill.color),
    fill.color = normalizeKeyframes(fill.color);
    var opacity = data.property("ADBE Vector Fill Opacity");
    return (opacity.isTimeVarying || 100 !== opacity.value) && (opacity = getProperty(opacity),
    opacity = normalizeKeyframes(opacity), opacity = divideValue(opacity, 100), fill.opacity = opacity),
    fill;
}

function getStroke(data) {
    function setStrokeTypeAsString(number) {
        switch (number) {
            case 2:
                return "round";

            case 3:
                return "bevel";

            default:
                return "miter";
        }
    }
    function setCapTypeAsString(number) {
        switch (number) {
            case 2:
                return "round";

            case 3:
                return "square";

            default:
                return "butt";
        }
    }
    var stroke = {};
    stroke.index = data.propertyIndex, stroke.join = data.property("ADBE Vector Stroke Line Join").value,
    1 === stroke.join && (stroke.miterLimit = getProperty(data.property("ADBE Vector Stroke Miter Limit"))),
    stroke.join = setStrokeTypeAsString(stroke.join), stroke.cap = data.property("ADBE Vector Stroke Line Cap").value,
    stroke.cap = setCapTypeAsString(stroke.cap), stroke.color = getProperty(data.property("ADBE Vector Stroke Color")),
    stroke.color = removeValues(stroke.color, 3), stroke.color = multiplyValue(stroke.color, 255),
    stroke.color = roundValue(stroke.color), stroke.color = normalizeKeyframes(stroke.color),
    stroke.opacity = getProperty(data.property("ADBE Vector Stroke Opacity")), stroke.opacity = normalizeKeyframes(stroke.opacity),
    stroke.opacity = divideValue(stroke.opacity, 100), stroke.width = getProperty(data.property("ADBE Vector Stroke Width")),
    stroke.width = normalizeKeyframes(stroke.width);
    var dash = data.property("ADBE Vector Stroke Dash 1");
    stroke.dash && (stroke.dash = getProperty(dash), stroke.dash = normalizeKeyframes(dash));
    var gap = data.property("ADBE Vector Stroke Gap 1");
    gap && (stroke.gap = getProperty(gap), stroke.gap = normalizeKeyframes(gap));
    var offset = data.property("ADBE Vector Stroke Offset");
    return offset && (stroke.offset = getProperty(offset), stroke.offset = normalizeKeyframes(offset)),
    stroke;
}

function getMerge(data) {
    var merge = {};
    return merge.type = data.property("ADBE Vector Merge Type").value, merge;
}

function getVectorTrim(data) {
    var trim = {};
    trim.type = data.property("ADBE Vector Trim Type").value;
    var start = data.property("ADBE Vector Trim Start");
    (start.isTimeVarying || 0 !== start.value) && (trim.start = getProperty(start),
    trim.start = normalizeKeyframes(trim.start), trim.start = divideValue(trim.start, 100));
    var end = data.property("ADBE Vector Trim End");
    return (end.isTimeVarying || 100 !== end.value) && (trim.end = getProperty(end),
    trim.end = normalizeKeyframes(trim.end), trim.end = divideValue(trim.end, 100)),
    trim;
}

function getProperty(data, split) {
    return data.numKeys < 1 ? getStaticProperty(data, split) : getAnimatedProperty(data, split);
}

function getStaticProperty(data, split) {
    var arr = [];
    return data.value instanceof Array && "number" == typeof split ? arr.push({
        t: 0,
        v: data.value[split]
    }) : arr.push({
        t: 0,
        v: data.value
    }), arr;
}

function getAnimatedProperty(data, split) {
    for (var arr = [], numKeys = data.numKeys, i = 1; numKeys >= i; i++) {
        var inType, outType, easeIn, easeOut, obj = {};
        obj.t = 1e3 * data.keyTime(i), inType = data.keyInInterpolationType(i), outType = data.keyOutInterpolationType(i),
        "number" == typeof split && data.keyInTemporalEase(i)[split] && data.keyOutTemporalEase(i)[split] ? (easeIn = data.keyInTemporalEase(i)[split],
        easeOut = data.keyOutTemporalEase(i)[split]) : (easeIn = data.keyInTemporalEase(i)[0],
        easeOut = data.keyOutTemporalEase(i)[0]), "number" == typeof split ? obj.v = data.keyValue(i)[split] : obj.v = data.keyValue(i),
        i > 1 && inType !== KeyframeInterpolationType.HOLD && (obj.inType = inType, obj.easeIn = [],
        obj.easeIn[0] = easeIn.influence, obj.easeIn[1] = easeIn.speed), numKeys > i && outType !== KeyframeInterpolationType.HOLD && (obj.outType = outType,
        obj.easeOut = [], obj.easeOut[0] = easeOut.influence, obj.easeOut[1] = easeOut.speed),
        (data.propertyValueType === PropertyValueType.TwoD_SPATIAL || data.propertyValueType === PropertyValueType.ThreeD_SPATIAL) && (i > 1 && (obj.inTangent = data.keyInSpatialTangent(i),
        obj.easeIn = [], obj.easeIn[0] = easeIn.influence, obj.easeIn[1] = easeIn.speed),
        numKeys > i && (obj.outTangent = data.keyOutSpatialTangent(i), obj.easeOut = [],
        obj.easeOut[0] = easeOut.influence, obj.easeOut[1] = easeOut.speed)), arr.push(obj);
    }
    return arr;
}

function getActiveItem() {
    var data = {
        id: null,
        name: null
    };
    var activeItem = app.project.activeItem;
    //$.writeln('activeItem: ', activeItem);
    //$.writeln('id: ', activeItem.id);
    //$.writeln('selected: ', activeItem.selected);
    //$.writeln('name: ', activeItem.name);
    if (activeItem) {
        data = {
            'id': activeItem.id,
            'name': activeItem.name
        };
    };

    if (typeof JSON !== 'object') {
        return '{"id":"' + activeItem.id + '","name": "' + activeItem.name + '"}'
    };

    return JSON.stringify(data);

    //app.enableQE();

    //var t = activeItem.getRenderGUID();
    //$.writeln('guid: ', t);

    //var myMarker = new MarkerValue("jimmi test");
    //app.project.activeItem.layers[1].property("Marker").setValueAtTime(2, myMarker);
    //$.writeln('propertyValueType', app.project.activeItem);
    //$.writeln('items: ', app.project.items);
    //$.writeln('layer: ', app.project.item(1));
    //$.writeln('file: ', app.project.activeItem.layers[1].name);

    //var activeItem = app.project.activeItem;
    //data.id = activeItem.id;
    //data.name = activeItem.name;
    //var tempNull = activeItem.layers.addNull(activeItem.duration);
    //$.writeln('tempNull: ', tempNull);
    //$.writeln('tempNull1: ', tempNull.property("ADBE Transform Group").property("ADBE Position"));
    //$.writeln('file32: ', tempNull.property("ADBE Transform Group").property("ADBE Position").value);

    ////var data = getComp(app.project.activeItem)

    //$.writeln('data: ', data);
    //$.writeln('markers: ', data.markers);
    //$.writeln('length: ', data.markers.length);
    //$.writeln('length: ', data.markers[0].comment);
    ////var activeItem = app.project.activeItem;
    ////var tempNull = activeItem.layers.addNull(activeItem.duration);
    ////var tempPos = tempNull.property("ADBE Transform Group").property("ADBE Position");

    ////tempPos.expression = "x = thisComp.marker.numKeys;[x,0];"; 
    ////var result = tempPos.value[0];

    ////$.writeln("There are " + result + " comp markers");

    ////for (x = 1; x <= result; x++) {
    ////    tempPos.expression = "x = thisComp.marker.key(" + x + ").time;[x,0];";
    ////    $.writeln("Marker " + x + " time = " + tempPos.value[0]);
    ////}

    ////tempNull.remove();



    ////var activeSequence = app.project.getActiveSequence();
    ////if (activeSequence) {
    ////    data = {
    ////        'id': activeSequence.guid,
    ////        'name': activeSequence.name
    ////    };
    ////}
    ////if (typeof JSON !== 'object') {
    ////    return '{"id":"' + activeSequence.guid + '","name": "' + activeSequence.name + '"}'
    ////}
    //return JSON.stringify(data);
}

function calculateOutputFilename(outputPath, activeSequence, extension) {
    return outputPath + getPathSeparatorByOS() + activeSequence.name + "." + extension;
}

function getPathSeparatorByOS() {
    //app.enableQE();
    //if (qe === undefined || qe === null || qe.project === undefined || qe.project === null) {
    //    return;
    //}

    //if (qe.platform !== undefined && qe.platform === 'Macintosh') {
    //    return '/';
    //} else {
    return '\\';
    //}
}

function loadPluginLib() {
    var eoName;
    if (Folder.fs == 'Macintosh') {
        eoName = "PlugPlugExternalObject";
    } else {
        eoName = "PlugPlugExternalObject.dll";
    }

    try {
        new ExternalObject('lib:' + eoName);
    } catch (error) {
        alert(error);
    }
}

function getPresetPath(presetPath) {
    if (presetPath != null) {
        return presetPath;
    }
    if (Folder.fs == 'Macintosh') {
        return "/Applications/Adobe\ Premiere\ Pro\ CC\ 2015/Adobe\ Premiere\ Pro\ CC\ 2015.app/Contents/MediaIO/systempresets/58444341_4d584658/XDCAMHD\ 50\ NTSC\ 60i.epr";
    } else {
        return "C:\\Program Files\\Adobe\\Adobe Media Encoder CC 2015\\MediaIO\\systempresets\\58444341_4d584658\\XDCAMHD 50 NTSC 60i.epr";
    }
}

function clearSequenceMarkers() {
    if (app.project.activeSequence != undefined) {
        var ms = [];
        var markers = app.project.activeSequence.markers;
        for (var current_marker = markers.getFirstMarker() ;
            current_marker != undefined;
            current_marker = markers.getNextMarker(current_marker)) {
            ms.push(current_marker);
        }
        for (var i = 0; i < ms.length; i++) {
            markers.deleteMarker(ms[i]);
        }
    }
}

function createSequenceMarkers(inMarkers) {

    if (typeof app.project.activeSequence != "undefined" && typeof inMarkers != "undefined") {
        var json;
        if (typeof JSON !== 'object') {
            json = Function("return " + inMarkers + "")();
        } else {
            json = JSON.parse(inMarkers);
        }

        for (var i = 0; i < json.length; i++) {
            createSequenceMarker(json[i])
        }
    }
}

function createSequenceMarker(marker) {
    var sequenceMarkers = app.project.activeSequence.markers;
    var newMarker = sequenceMarkers.createMarker(marker.start);
    newMarker.name = marker.name;
    newMarker.comments = marker.comments.replace(/<br\s*[\/]?>/gi, '\n');
    newMarker.comments = newMarker.comments.replace(/&#39;/g, "'")
    newMarker.comments = newMarker.comments.replace(/&#47;/g, "/")
    newMarker.comments = newMarker.comments.replace(/&#92;/g, "\\");
    newMarker.comments = newMarker.comments.replace(/&#34;/g, "\"");
    newMarker.end = marker.end;
}

function getPathAsFile(path) {
    var file = new File(path);
    return file;
}