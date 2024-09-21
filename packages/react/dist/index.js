// components/side-nav.tsx
import {
  ListBox as RAListBox,
  ListBoxItem as RAListBoxItem,
  Button as RAButton2
} from "react-aria-components";

// styled-system/helpers.js
function isObject(value) {
  return typeof value === "object" && value != null && !Array.isArray(value);
}
function compact(value) {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([_, value2]) => value2 !== void 0));
}
var isBaseCondition = (v) => v === "base";
function filterBaseConditions(c) {
  return c.slice().filter((v) => !isBaseCondition(v));
}
function toChar(code) {
  return String.fromCharCode(code + (code > 25 ? 39 : 97));
}
function toName(code) {
  let name = "";
  let x;
  for (x = Math.abs(code); x > 52; x = x / 52 | 0)
    name = toChar(x % 52) + name;
  return toChar(x % 52) + name;
}
function toPhash(h, x) {
  let i = x.length;
  while (i)
    h = h * 33 ^ x.charCodeAt(--i);
  return h;
}
function toHash(value) {
  return toName(toPhash(5381, value) >>> 0);
}
var importantRegex = /\s*!(important)?/i;
function isImportant(value) {
  return typeof value === "string" ? importantRegex.test(value) : false;
}
function withoutImportant(value) {
  return typeof value === "string" ? value.replace(importantRegex, "").trim() : value;
}
function withoutSpace(str) {
  return typeof str === "string" ? str.replaceAll(" ", "_") : str;
}
var memo = (fn) => {
  const cache = /* @__PURE__ */ new Map();
  const get = (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
  return get;
};
function mergeProps(...sources) {
  const objects = sources.filter(Boolean);
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const prevValue = prev[key];
      const value = obj[key];
      if (isObject(prevValue) && isObject(value)) {
        prev[key] = mergeProps(prevValue, value);
      } else {
        prev[key] = value;
      }
    });
    return prev;
  }, {});
}
var isNotNullish = (element) => element != null;
function walkObject(target, predicate, options = {}) {
  const { stop, getKey } = options;
  function inner(value, path = []) {
    if (isObject(value) || Array.isArray(value)) {
      const result = {};
      for (const [prop, child] of Object.entries(value)) {
        const key = getKey?.(prop, child) ?? prop;
        const childPath = [...path, key];
        if (stop?.(value, childPath)) {
          return predicate(value, path);
        }
        const next = inner(child, childPath);
        if (isNotNullish(next)) {
          result[key] = next;
        }
      }
      return result;
    }
    return predicate(value, path);
  }
  return inner(target);
}
function mapObject(obj, fn) {
  if (Array.isArray(obj))
    return obj.map((value) => fn(value));
  if (!isObject(obj))
    return fn(obj);
  return walkObject(obj, (value) => fn(value));
}
function toResponsiveObject(values, breakpoints) {
  return values.reduce(
    (acc, current, index) => {
      const key = breakpoints[index];
      if (current != null) {
        acc[key] = current;
      }
      return acc;
    },
    {}
  );
}
function normalizeStyleObject(styles, context2, shorthand = true) {
  const { utility, conditions: conditions2 } = context2;
  const { hasShorthand, resolveShorthand: resolveShorthand2 } = utility;
  return walkObject(
    styles,
    (value) => {
      return Array.isArray(value) ? toResponsiveObject(value, conditions2.breakpoints.keys) : value;
    },
    {
      stop: (value) => Array.isArray(value),
      getKey: shorthand ? (prop) => hasShorthand ? resolveShorthand2(prop) : prop : void 0
    }
  );
}
var fallbackCondition = {
  shift: (v) => v,
  finalize: (v) => v,
  breakpoints: { keys: [] }
};
var sanitize = (value) => typeof value === "string" ? value.replaceAll(/[\n\s]+/g, " ") : value;
function createCss(context2) {
  const { utility, hash, conditions: conds = fallbackCondition } = context2;
  const formatClassName = (str) => [utility.prefix, str].filter(Boolean).join("-");
  const hashFn = (conditions2, className) => {
    let result;
    if (hash) {
      const baseArray = [...conds.finalize(conditions2), className];
      result = formatClassName(utility.toHash(baseArray, toHash));
    } else {
      const baseArray = [...conds.finalize(conditions2), formatClassName(className)];
      result = baseArray.join(":");
    }
    return result;
  };
  return memo(({ base, ...styles } = {}) => {
    const styleObject = Object.assign(styles, base);
    const normalizedObject = normalizeStyleObject(styleObject, context2);
    const classNames = /* @__PURE__ */ new Set();
    walkObject(normalizedObject, (value, paths) => {
      const important = isImportant(value);
      if (value == null)
        return;
      const [prop, ...allConditions] = conds.shift(paths);
      const conditions2 = filterBaseConditions(allConditions);
      const transformed = utility.transform(prop, withoutImportant(sanitize(value)));
      let className = hashFn(conditions2, transformed.className);
      if (important)
        className = `${className}!`;
      classNames.add(className);
    });
    return Array.from(classNames).join(" ");
  });
}
function compactStyles(...styles) {
  return styles.flat().filter((style) => isObject(style) && Object.keys(compact(style)).length > 0);
}
function createMergeCss(context2) {
  function resolve(styles) {
    const allStyles = compactStyles(...styles);
    if (allStyles.length === 1)
      return allStyles;
    return allStyles.map((style) => normalizeStyleObject(style, context2));
  }
  function mergeCss2(...styles) {
    return mergeProps(...resolve(styles));
  }
  function assignCss2(...styles) {
    return Object.assign({}, ...resolve(styles));
  }
  return { mergeCss: memo(mergeCss2), assignCss: assignCss2 };
}
var wordRegex = /([A-Z])/g;
var msRegex = /^ms-/;
var hypenateProperty = memo((property) => {
  if (property.startsWith("--"))
    return property;
  return property.replace(wordRegex, "-$1").replace(msRegex, "-ms-").toLowerCase();
});
var fns = ["min", "max", "clamp", "calc"];
var fnRegExp = new RegExp(`^(${fns.join("|")})\\(.*\\)`);
var isCssFunction = (v) => typeof v === "string" && fnRegExp.test(v);
var lengthUnits = "cm,mm,Q,in,pc,pt,px,em,ex,ch,rem,lh,rlh,vw,vh,vmin,vmax,vb,vi,svw,svh,lvw,lvh,dvw,dvh,cqw,cqh,cqi,cqb,cqmin,cqmax,%";
var lengthUnitsPattern = `(?:${lengthUnits.split(",").join("|")})`;
var lengthRegExp = new RegExp(`^[+-]?[0-9]*.?[0-9]+(?:[eE][+-]?[0-9]+)?${lengthUnitsPattern}$`);
var isCssUnit = (v) => typeof v === "string" && lengthRegExp.test(v);
var isCssVar = (v) => typeof v === "string" && /^var\(--.+\)$/.test(v);
var patternFns = {
  map: mapObject,
  isCssFunction,
  isCssVar,
  isCssUnit
};
var getPatternStyles = (pattern, styles) => {
  if (!pattern?.defaultValues)
    return styles;
  const defaults2 = typeof pattern.defaultValues === "function" ? pattern.defaultValues(styles) : pattern.defaultValues;
  return Object.assign({}, defaults2, compact(styles));
};
function splitProps(props, ...keys) {
  const descriptors = Object.getOwnPropertyDescriptors(props);
  const dKeys = Object.keys(descriptors);
  const split = (k) => {
    const clone = {};
    for (let i = 0; i < k.length; i++) {
      const key = k[i];
      if (descriptors[key]) {
        Object.defineProperty(clone, key, descriptors[key]);
        delete descriptors[key];
      }
    }
    return clone;
  };
  const fn = (key) => split(Array.isArray(key) ? key : dKeys.filter(key));
  return keys.map(fn).concat(split(dKeys));
}
var uniq = (...items) => items.filter(Boolean).reduce((acc, item) => Array.from(/* @__PURE__ */ new Set([...acc, ...item])), []);
var htmlProps = ["htmlSize", "htmlTranslate", "htmlWidth", "htmlHeight"];
function convert(key) {
  return htmlProps.includes(key) ? key.replace("html", "").toLowerCase() : key;
}
function normalizeHTMLProps(props) {
  return Object.fromEntries(Object.entries(props).map(([key, value]) => [convert(key), value]));
}
normalizeHTMLProps.keys = htmlProps;

// styled-system/css/conditions.js
var conditionsStr = "_hover,_focus,_focusWithin,_focusVisible,_disabled,_active,_visited,_target,_readOnly,_readWrite,_empty,_checked,_enabled,_expanded,_highlighted,_before,_after,_firstLetter,_firstLine,_marker,_selection,_file,_backdrop,_first,_last,_only,_even,_odd,_firstOfType,_lastOfType,_onlyOfType,_peerFocus,_peerHover,_peerActive,_peerFocusWithin,_peerFocusVisible,_peerDisabled,_peerChecked,_peerInvalid,_peerExpanded,_peerPlaceholderShown,_groupFocus,_groupHover,_groupActive,_groupFocusWithin,_groupFocusVisible,_groupDisabled,_groupChecked,_groupExpanded,_groupInvalid,_indeterminate,_required,_valid,_invalid,_autofill,_inRange,_outOfRange,_placeholder,_placeholderShown,_pressed,_selected,_default,_optional,_open,_closed,_fullscreen,_loading,_currentPage,_currentStep,_motionReduce,_motionSafe,_print,_landscape,_portrait,_dark,_light,_osDark,_osLight,_highContrast,_lessContrast,_moreContrast,_ltr,_rtl,_scrollbar,_scrollbarThumb,_scrollbarTrack,_horizontal,_vertical,_starting,sm,smOnly,smDown,md,mdOnly,mdDown,lg,lgOnly,lgDown,xl,xlOnly,xlDown,2xl,2xlOnly,2xlDown,smToMd,smToLg,smToXl,smTo2xl,mdToLg,mdToXl,mdTo2xl,lgToXl,lgTo2xl,xlTo2xl,@/xs,@/md,@/lg,@/xl,@/2xl,@/3xl,@/4xl,@/5xl,@/6xl,@/7xl,@/8xl,@/sm,base";
var conditions = new Set(conditionsStr.split(","));
function isCondition(value) {
  return conditions.has(value) || /^@|&|&$/.test(value);
}
var underscoreRegex = /^_/;
var conditionsSelectorRegex = /&|@/;
function finalizeConditions(paths) {
  return paths.map((path) => {
    if (conditions.has(path)) {
      return path.replace(underscoreRegex, "");
    }
    if (conditionsSelectorRegex.test(path)) {
      return `[${withoutSpace(path.trim())}]`;
    }
    return path;
  });
}
function sortConditions(paths) {
  return paths.sort((a, b) => {
    const aa = isCondition(a);
    const bb = isCondition(b);
    if (aa && !bb) return 1;
    if (!aa && bb) return -1;
    return 0;
  });
}

// styled-system/css/css.js
var utilities = "aspectRatio:asp,boxDecorationBreak:bx-db,zIndex:z,boxSizing:bx-s,objectPosition:obj-p,objectFit:obj-f,overscrollBehavior:ovs-b,overscrollBehaviorX:ovs-bx,overscrollBehaviorY:ovs-by,position:pos/1,top:top,left:left,inset:inset,insetInline:inset-x/insetX,insetBlock:inset-y/insetY,insetBlockEnd:inset-be,insetBlockStart:inset-bs,insetInlineEnd:inset-e/insetEnd/end,insetInlineStart:inset-s/insetStart/start,right:right,bottom:bottom,float:float,visibility:vis,display:d,hideFrom:hide,hideBelow:show,flexBasis:flex-b,flex:flex,flexDirection:flex-d/flexDir,flexGrow:flex-g,flexShrink:flex-sh,gridTemplateColumns:grid-tc,gridTemplateRows:grid-tr,gridColumn:grid-c,gridRow:grid-r,gridColumnStart:grid-cs,gridColumnEnd:grid-ce,gridAutoFlow:grid-af,gridAutoColumns:grid-ac,gridAutoRows:grid-ar,gap:gap,gridGap:grid-g,gridRowGap:grid-rg,gridColumnGap:grid-cg,rowGap:rg,columnGap:cg,justifyContent:jc,alignContent:ac,alignItems:ai,alignSelf:as,padding:p/1,paddingLeft:pl/1,paddingRight:pr/1,paddingTop:pt/1,paddingBottom:pb/1,paddingBlock:py/1/paddingY,paddingBlockEnd:pbe,paddingBlockStart:pbs,paddingInline:px/paddingX/1,paddingInlineEnd:pe/1/paddingEnd,paddingInlineStart:ps/1/paddingStart,marginLeft:ml/1,marginRight:mr/1,marginTop:mt/1,marginBottom:mb/1,margin:m/1,marginBlock:my/1/marginY,marginBlockEnd:mbe,marginBlockStart:mbs,marginInline:mx/1/marginX,marginInlineEnd:me/1/marginEnd,marginInlineStart:ms/1/marginStart,spaceX:sx,spaceY:sy,outlineWidth:ring-w/ringWidth,outlineColor:ring-c/ringColor,outline:ring/1,outlineOffset:ring-o/ringOffset,divideX:dvd-x,divideY:dvd-y,divideColor:dvd-c,divideStyle:dvd-s,width:w/1,inlineSize:w-is,minWidth:min-w/minW,minInlineSize:min-w-is,maxWidth:max-w/maxW,maxInlineSize:max-w-is,height:h/1,blockSize:h-bs,minHeight:min-h/minH,minBlockSize:min-h-bs,maxHeight:max-h/maxH,maxBlockSize:max-b,color:c,fontFamily:ff,fontSize:fs,fontSizeAdjust:fs-a,fontPalette:fp,fontKerning:fk,fontFeatureSettings:ff-s,fontWeight:fw,fontSmoothing:fsmt,fontVariant:fv,fontVariantAlternates:fv-alt,fontVariantCaps:fv-caps,fontVariationSettings:fv-s,fontVariantNumeric:fv-num,letterSpacing:ls,lineHeight:lh,textAlign:ta,textDecoration:td,textDecorationColor:td-c,textEmphasisColor:te-c,textDecorationStyle:td-s,textDecorationThickness:td-t,textUnderlineOffset:tu-o,textTransform:tt,textIndent:ti,textShadow:tsh,textShadowColor:tsh-c/textShadowColor,textOverflow:tov,verticalAlign:va,wordBreak:wb,textWrap:tw,truncate:trunc,lineClamp:lc,listStyleType:li-t,listStylePosition:li-pos,listStyleImage:li-img,listStyle:li-s,backgroundPosition:bg-p/bgPosition,backgroundPositionX:bg-p-x/bgPositionX,backgroundPositionY:bg-p-y/bgPositionY,backgroundAttachment:bg-a/bgAttachment,backgroundClip:bg-cp/bgClip,background:bg/1,backgroundColor:bg-c/bgColor,backgroundOrigin:bg-o/bgOrigin,backgroundImage:bg-i/bgImage,backgroundRepeat:bg-r/bgRepeat,backgroundBlendMode:bg-bm/bgBlendMode,backgroundSize:bg-s/bgSize,backgroundGradient:bg-grad/bgGradient,textGradient:txt-grad,gradientFromPosition:grad-from-pos,gradientToPosition:grad-to-pos,gradientFrom:grad-from,gradientTo:grad-to,gradientVia:grad-via,gradientViaPosition:grad-via-pos,borderRadius:bdr/rounded,borderTopLeftRadius:bdr-tl/roundedTopLeft,borderTopRightRadius:bdr-tr/roundedTopRight,borderBottomRightRadius:bdr-br/roundedBottomRight,borderBottomLeftRadius:bdr-bl/roundedBottomLeft,borderTopRadius:bdr-t/roundedTop,borderRightRadius:bdr-r/roundedRight,borderBottomRadius:bdr-b/roundedBottom,borderLeftRadius:bdr-l/roundedLeft,borderStartStartRadius:bdr-ss/roundedStartStart,borderStartEndRadius:bdr-se/roundedStartEnd,borderStartRadius:bdr-s/roundedStart,borderEndStartRadius:bdr-es/roundedEndStart,borderEndEndRadius:bdr-ee/roundedEndEnd,borderEndRadius:bdr-e/roundedEnd,border:bd,borderWidth:bd-w,borderTopWidth:bd-t-w,borderLeftWidth:bd-l-w,borderRightWidth:bd-r-w,borderBottomWidth:bd-b-w,borderColor:bd-c,borderInline:bd-x/borderX,borderInlineWidth:bd-x-w/borderXWidth,borderInlineColor:bd-x-c/borderXColor,borderBlock:bd-y/borderY,borderBlockWidth:bd-y-w/borderYWidth,borderBlockColor:bd-y-c/borderYColor,borderLeft:bd-l,borderLeftColor:bd-l-c,borderInlineStart:bd-s/borderStart,borderInlineStartWidth:bd-s-w/borderStartWidth,borderInlineStartColor:bd-s-c/borderStartColor,borderRight:bd-r,borderRightColor:bd-r-c,borderInlineEnd:bd-e/borderEnd,borderInlineEndWidth:bd-e-w/borderEndWidth,borderInlineEndColor:bd-e-c/borderEndColor,borderTop:bd-t,borderTopColor:bd-t-c,borderBottom:bd-b,borderBottomColor:bd-b-c,borderBlockEnd:bd-be,borderBlockEndColor:bd-be-c,borderBlockStart:bd-bs,borderBlockStartColor:bd-bs-c,opacity:op,boxShadow:bx-sh/shadow,boxShadowColor:bx-sh-c/shadowColor,mixBlendMode:mix-bm,filter:filter,brightness:brightness,contrast:contrast,grayscale:grayscale,hueRotate:hue-rotate,invert:invert,saturate:saturate,sepia:sepia,dropShadow:drop-shadow,blur:blur,backdropFilter:bkdp,backdropBlur:bkdp-blur,backdropBrightness:bkdp-brightness,backdropContrast:bkdp-contrast,backdropGrayscale:bkdp-grayscale,backdropHueRotate:bkdp-hue-rotate,backdropInvert:bkdp-invert,backdropOpacity:bkdp-opacity,backdropSaturate:bkdp-saturate,backdropSepia:bkdp-sepia,borderCollapse:bd-cl,borderSpacing:bd-sp,borderSpacingX:bd-sx,borderSpacingY:bd-sy,tableLayout:tbl,transitionTimingFunction:trs-tmf,transitionDelay:trs-dly,transitionDuration:trs-dur,transitionProperty:trs-prop,transition:trs,animation:anim,animationName:anim-n,animationTimingFunction:anim-tmf,animationDuration:anim-dur,animationDelay:anim-dly,animationPlayState:anim-ps,animationComposition:anim-comp,animationFillMode:anim-fm,animationDirection:anim-dir,animationIterationCount:anim-ic,animationRange:anim-r,animationState:anim-s,animationRangeStart:anim-rs,animationRangeEnd:anim-re,animationTimeline:anim-tl,transformOrigin:trf-o,transformBox:trf-b,transformStyle:trf-s,transform:trf,rotate:rotate,rotateX:rotate-x,rotateY:rotate-y,rotateZ:rotate-z,scale:scale,scaleX:scale-x,scaleY:scale-y,translate:translate,translateX:translate-x/x,translateY:translate-y/y,translateZ:translate-z/z,accentColor:ac-c,caretColor:ca-c,scrollBehavior:scr-bhv,scrollbar:scr-bar,scrollbarColor:scr-bar-c,scrollbarGutter:scr-bar-g,scrollbarWidth:scr-bar-w,scrollMargin:scr-m,scrollMarginLeft:scr-ml,scrollMarginRight:scr-mr,scrollMarginTop:scr-mt,scrollMarginBottom:scr-mb,scrollMarginBlock:scr-my/scrollMarginY,scrollMarginBlockEnd:scr-mbe,scrollMarginBlockStart:scr-mbt,scrollMarginInline:scr-mx/scrollMarginX,scrollMarginInlineEnd:scr-me,scrollMarginInlineStart:scr-ms,scrollPadding:scr-p,scrollPaddingBlock:scr-py/scrollPaddingY,scrollPaddingBlockStart:scr-pbs,scrollPaddingBlockEnd:scr-pbe,scrollPaddingInline:scr-px/scrollPaddingX,scrollPaddingInlineEnd:scr-pe,scrollPaddingInlineStart:scr-ps,scrollPaddingLeft:scr-pl,scrollPaddingRight:scr-pr,scrollPaddingTop:scr-pt,scrollPaddingBottom:scr-pb,scrollSnapAlign:scr-sa,scrollSnapStop:scrs-s,scrollSnapType:scrs-t,scrollSnapStrictness:scrs-strt,scrollSnapMargin:scrs-m,scrollSnapMarginTop:scrs-mt,scrollSnapMarginBottom:scrs-mb,scrollSnapMarginLeft:scrs-ml,scrollSnapMarginRight:scrs-mr,scrollSnapCoordinate:scrs-c,scrollSnapDestination:scrs-d,scrollSnapPointsX:scrs-px,scrollSnapPointsY:scrs-py,scrollSnapTypeX:scrs-tx,scrollSnapTypeY:scrs-ty,scrollTimeline:scrtl,scrollTimelineAxis:scrtl-a,scrollTimelineName:scrtl-n,touchAction:tch-a,userSelect:us,overflow:ov,overflowWrap:ov-wrap,overflowX:ov-x,overflowY:ov-y,overflowAnchor:ov-a,overflowBlock:ov-b,overflowInline:ov-i,overflowClipBox:ovcp-bx,overflowClipMargin:ovcp-m,overscrollBehaviorBlock:ovs-bb,overscrollBehaviorInline:ovs-bi,fill:fill,stroke:stk,strokeWidth:stk-w,strokeDasharray:stk-dsh,strokeDashoffset:stk-do,strokeLinecap:stk-lc,strokeLinejoin:stk-lj,strokeMiterlimit:stk-ml,strokeOpacity:stk-op,srOnly:sr,debug:debug,appearance:ap,backfaceVisibility:bfv,clipPath:cp-path,hyphens:hy,mask:msk,maskImage:msk-i,maskSize:msk-s,textSizeAdjust:txt-adj,container:cq,containerName:cq-n,containerType:cq-t,textStyle:textStyle";
var classNameByProp = /* @__PURE__ */ new Map();
var shorthands = /* @__PURE__ */ new Map();
utilities.split(",").forEach((utility) => {
  const [prop, meta] = utility.split(":");
  const [className, ...shorthandList] = meta.split("/");
  classNameByProp.set(prop, className);
  if (shorthandList.length) {
    shorthandList.forEach((shorthand) => {
      shorthands.set(shorthand === "1" ? className : shorthand, prop);
    });
  }
});
var resolveShorthand = (prop) => shorthands.get(prop) || prop;
var context = {
  conditions: {
    shift: sortConditions,
    finalize: finalizeConditions,
    breakpoints: { keys: ["base", "sm", "md", "lg", "xl", "2xl"] }
  },
  utility: {
    prefix: "vestia",
    transform: (prop, value) => {
      const key = resolveShorthand(prop);
      const propKey = classNameByProp.get(key) || hypenateProperty(key);
      return { className: `${propKey}_${withoutSpace(value)}` };
    },
    hasShorthand: true,
    toHash: (path, hashFn) => hashFn(path.join(":")),
    resolveShorthand
  }
};
var cssFn = createCss(context);
var css = (...styles) => cssFn(mergeCss(...styles));
css.raw = (...styles) => mergeCss(...styles);
var { mergeCss, assignCss } = createMergeCss(context);

// styled-system/css/cx.js
function cx() {
  let str = "", i = 0, arg;
  for (; i < arguments.length; ) {
    if ((arg = arguments[i++]) && typeof arg === "string") {
      str && (str += " ");
      str += arg;
    }
  }
  return str;
}

// styled-system/css/cva.js
var defaults = (conf) => ({
  base: {},
  variants: {},
  defaultVariants: {},
  compoundVariants: [],
  ...conf
});
function cva(config) {
  const { base, variants, defaultVariants, compoundVariants } = defaults(config);
  const getVariantProps = (variants2) => ({ ...defaultVariants, ...compact(variants2) });
  function resolve(props = {}) {
    const computedVariants = getVariantProps(props);
    let variantCss = { ...base };
    for (const [key, value] of Object.entries(computedVariants)) {
      if (variants[key]?.[value]) {
        variantCss = mergeCss(variantCss, variants[key][value]);
      }
    }
    const compoundVariantCss = getCompoundVariantCss(compoundVariants, computedVariants);
    return mergeCss(variantCss, compoundVariantCss);
  }
  function merge(__cva) {
    const override = defaults(__cva.config);
    const variantKeys2 = uniq(__cva.variantKeys, Object.keys(variants));
    return cva({
      base: mergeCss(base, override.base),
      variants: Object.fromEntries(
        variantKeys2.map((key) => [key, mergeCss(variants[key], override.variants[key])])
      ),
      defaultVariants: mergeProps(defaultVariants, override.defaultVariants),
      compoundVariants: [...compoundVariants, ...override.compoundVariants]
    });
  }
  function cvaFn(props) {
    return css(resolve(props));
  }
  const variantKeys = Object.keys(variants);
  function splitVariantProps(props) {
    return splitProps(props, variantKeys);
  }
  const variantMap = Object.fromEntries(Object.entries(variants).map(([key, value]) => [key, Object.keys(value)]));
  return Object.assign(memo(cvaFn), {
    __cva__: true,
    variantMap,
    variantKeys,
    raw: resolve,
    config,
    merge,
    splitVariantProps,
    getVariantProps
  });
}
function getCompoundVariantCss(compoundVariants, variantMap) {
  let result = {};
  compoundVariants.forEach((compoundVariant) => {
    const isMatching = Object.entries(compoundVariant).every(([key, value]) => {
      if (key === "css") return true;
      const values = Array.isArray(value) ? value : [value];
      return values.some((value2) => variantMap[key] === value2);
    });
    if (isMatching) {
      result = mergeCss(result, compoundVariant.css);
    }
  });
  return result;
}

// components/side-nav.tsx
import { useState } from "react";

// components/icon.tsx
import { icons } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
var CustomIcons = {
  twitter: (props) => /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx("path", { d: "M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148a13.98 13.98 0 0 0 10.15 5.144 4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z" }) }),
  gitHub: (props) => /* @__PURE__ */ jsx("svg", { viewBox: "0 0 438.549 438.549", ...props, children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "currentColor",
      d: "M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
    }
  ) }),
  google: (props) => /* @__PURE__ */ jsx("svg", { role: "img", viewBox: "0 0 24 24", ...props, children: /* @__PURE__ */ jsx(
    "path",
    {
      fill: "currentColor",
      d: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
    }
  ) }),
  slash: (props) => /* @__PURE__ */ jsx(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "4",
      className: "rotate-[-18deg] h-5 opacity-70",
      children: /* @__PURE__ */ jsx("path", { d: "M22 2 2 22" })
    }
  ),
  ellipsis: (props) => /* @__PURE__ */ jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props,
      children: [
        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1" }),
        /* @__PURE__ */ jsx("circle", { cx: "19", cy: "12", r: "1" }),
        /* @__PURE__ */ jsx("circle", { cx: "5", cy: "12", r: "1" })
      ]
    }
  )
};
var Icon = ({
  name,
  size,
  ...props
}) => {
  const LucideIcon = icons[name];
  return /* @__PURE__ */ jsx(LucideIcon, { size: Number(size || 14) * 1.5, ...props });
};
var icon_default = Icon;

// styled-system/jsx/factory.js
import { createElement, forwardRef, useMemo } from "react";

// styled-system/jsx/is-valid-prop.js
var userGeneratedStr = "css,pos,insetX,insetY,insetEnd,end,insetStart,start,flexDir,p,pl,pr,pt,pb,py,paddingY,paddingX,px,pe,paddingEnd,ps,paddingStart,ml,mr,mt,mb,m,my,marginY,mx,marginX,me,marginEnd,ms,marginStart,ringWidth,ringColor,ring,ringOffset,w,minW,maxW,h,minH,maxH,textShadowColor,bgPosition,bgPositionX,bgPositionY,bgAttachment,bgClip,bg,bgColor,bgOrigin,bgImage,bgRepeat,bgBlendMode,bgSize,bgGradient,rounded,roundedTopLeft,roundedTopRight,roundedBottomRight,roundedBottomLeft,roundedTop,roundedRight,roundedBottom,roundedLeft,roundedStartStart,roundedStartEnd,roundedStart,roundedEndStart,roundedEndEnd,roundedEnd,borderX,borderXWidth,borderXColor,borderY,borderYWidth,borderYColor,borderStart,borderStartWidth,borderStartColor,borderEnd,borderEndWidth,borderEndColor,shadow,shadowColor,x,y,z,scrollMarginY,scrollMarginX,scrollPaddingY,scrollPaddingX,aspectRatio,boxDecorationBreak,zIndex,boxSizing,objectPosition,objectFit,overscrollBehavior,overscrollBehaviorX,overscrollBehaviorY,position,top,left,inset,insetInline,insetBlock,insetBlockEnd,insetBlockStart,insetInlineEnd,insetInlineStart,right,bottom,float,visibility,display,hideFrom,hideBelow,flexBasis,flex,flexDirection,flexGrow,flexShrink,gridTemplateColumns,gridTemplateRows,gridColumn,gridRow,gridColumnStart,gridColumnEnd,gridAutoFlow,gridAutoColumns,gridAutoRows,gap,gridGap,gridRowGap,gridColumnGap,rowGap,columnGap,justifyContent,alignContent,alignItems,alignSelf,padding,paddingLeft,paddingRight,paddingTop,paddingBottom,paddingBlock,paddingBlockEnd,paddingBlockStart,paddingInline,paddingInlineEnd,paddingInlineStart,marginLeft,marginRight,marginTop,marginBottom,margin,marginBlock,marginBlockEnd,marginBlockStart,marginInline,marginInlineEnd,marginInlineStart,spaceX,spaceY,outlineWidth,outlineColor,outline,outlineOffset,divideX,divideY,divideColor,divideStyle,width,inlineSize,minWidth,minInlineSize,maxWidth,maxInlineSize,height,blockSize,minHeight,minBlockSize,maxHeight,maxBlockSize,color,fontFamily,fontSize,fontSizeAdjust,fontPalette,fontKerning,fontFeatureSettings,fontWeight,fontSmoothing,fontVariant,fontVariantAlternates,fontVariantCaps,fontVariationSettings,fontVariantNumeric,letterSpacing,lineHeight,textAlign,textDecoration,textDecorationColor,textEmphasisColor,textDecorationStyle,textDecorationThickness,textUnderlineOffset,textTransform,textIndent,textShadow,textOverflow,verticalAlign,wordBreak,textWrap,truncate,lineClamp,listStyleType,listStylePosition,listStyleImage,listStyle,backgroundPosition,backgroundPositionX,backgroundPositionY,backgroundAttachment,backgroundClip,background,backgroundColor,backgroundOrigin,backgroundImage,backgroundRepeat,backgroundBlendMode,backgroundSize,backgroundGradient,textGradient,gradientFromPosition,gradientToPosition,gradientFrom,gradientTo,gradientVia,gradientViaPosition,borderRadius,borderTopLeftRadius,borderTopRightRadius,borderBottomRightRadius,borderBottomLeftRadius,borderTopRadius,borderRightRadius,borderBottomRadius,borderLeftRadius,borderStartStartRadius,borderStartEndRadius,borderStartRadius,borderEndStartRadius,borderEndEndRadius,borderEndRadius,border,borderWidth,borderTopWidth,borderLeftWidth,borderRightWidth,borderBottomWidth,borderColor,borderInline,borderInlineWidth,borderInlineColor,borderBlock,borderBlockWidth,borderBlockColor,borderLeft,borderLeftColor,borderInlineStart,borderInlineStartWidth,borderInlineStartColor,borderRight,borderRightColor,borderInlineEnd,borderInlineEndWidth,borderInlineEndColor,borderTop,borderTopColor,borderBottom,borderBottomColor,borderBlockEnd,borderBlockEndColor,borderBlockStart,borderBlockStartColor,opacity,boxShadow,boxShadowColor,mixBlendMode,filter,brightness,contrast,grayscale,hueRotate,invert,saturate,sepia,dropShadow,blur,backdropFilter,backdropBlur,backdropBrightness,backdropContrast,backdropGrayscale,backdropHueRotate,backdropInvert,backdropOpacity,backdropSaturate,backdropSepia,borderCollapse,borderSpacing,borderSpacingX,borderSpacingY,tableLayout,transitionTimingFunction,transitionDelay,transitionDuration,transitionProperty,transition,animation,animationName,animationTimingFunction,animationDuration,animationDelay,animationPlayState,animationComposition,animationFillMode,animationDirection,animationIterationCount,animationRange,animationState,animationRangeStart,animationRangeEnd,animationTimeline,transformOrigin,transformBox,transformStyle,transform,rotate,rotateX,rotateY,rotateZ,scale,scaleX,scaleY,translate,translateX,translateY,translateZ,accentColor,caretColor,scrollBehavior,scrollbar,scrollbarColor,scrollbarGutter,scrollbarWidth,scrollMargin,scrollMarginLeft,scrollMarginRight,scrollMarginTop,scrollMarginBottom,scrollMarginBlock,scrollMarginBlockEnd,scrollMarginBlockStart,scrollMarginInline,scrollMarginInlineEnd,scrollMarginInlineStart,scrollPadding,scrollPaddingBlock,scrollPaddingBlockStart,scrollPaddingBlockEnd,scrollPaddingInline,scrollPaddingInlineEnd,scrollPaddingInlineStart,scrollPaddingLeft,scrollPaddingRight,scrollPaddingTop,scrollPaddingBottom,scrollSnapAlign,scrollSnapStop,scrollSnapType,scrollSnapStrictness,scrollSnapMargin,scrollSnapMarginTop,scrollSnapMarginBottom,scrollSnapMarginLeft,scrollSnapMarginRight,scrollSnapCoordinate,scrollSnapDestination,scrollSnapPointsX,scrollSnapPointsY,scrollSnapTypeX,scrollSnapTypeY,scrollTimeline,scrollTimelineAxis,scrollTimelineName,touchAction,userSelect,overflow,overflowWrap,overflowX,overflowY,overflowAnchor,overflowBlock,overflowInline,overflowClipBox,overflowClipMargin,overscrollBehaviorBlock,overscrollBehaviorInline,fill,stroke,strokeWidth,strokeDasharray,strokeDashoffset,strokeLinecap,strokeLinejoin,strokeMiterlimit,strokeOpacity,srOnly,debug,appearance,backfaceVisibility,clipPath,hyphens,mask,maskImage,maskSize,textSizeAdjust,container,containerName,containerType,colorPalette,_hover,_focus,_focusWithin,_focusVisible,_disabled,_active,_visited,_target,_readOnly,_readWrite,_empty,_checked,_enabled,_expanded,_highlighted,_before,_after,_firstLetter,_firstLine,_marker,_selection,_file,_backdrop,_first,_last,_only,_even,_odd,_firstOfType,_lastOfType,_onlyOfType,_peerFocus,_peerHover,_peerActive,_peerFocusWithin,_peerFocusVisible,_peerDisabled,_peerChecked,_peerInvalid,_peerExpanded,_peerPlaceholderShown,_groupFocus,_groupHover,_groupActive,_groupFocusWithin,_groupFocusVisible,_groupDisabled,_groupChecked,_groupExpanded,_groupInvalid,_indeterminate,_required,_valid,_invalid,_autofill,_inRange,_outOfRange,_placeholder,_placeholderShown,_pressed,_selected,_default,_optional,_open,_closed,_fullscreen,_loading,_currentPage,_currentStep,_motionReduce,_motionSafe,_print,_landscape,_portrait,_dark,_light,_osDark,_osLight,_highContrast,_lessContrast,_moreContrast,_ltr,_rtl,_scrollbar,_scrollbarThumb,_scrollbarTrack,_horizontal,_vertical,_starting,sm,smOnly,smDown,md,mdOnly,mdDown,lg,lgOnly,lgDown,xl,xlOnly,xlDown,2xl,2xlOnly,2xlDown,smToMd,smToLg,smToXl,smTo2xl,mdToLg,mdToXl,mdTo2xl,lgToXl,lgTo2xl,xlTo2xl,@/xs,@/md,@/lg,@/xl,@/2xl,@/3xl,@/4xl,@/5xl,@/6xl,@/7xl,@/8xl,@/sm,textStyle";
var userGenerated = userGeneratedStr.split(",");
var cssPropertiesStr = "WebkitAppearance,WebkitBorderBefore,WebkitBorderBeforeColor,WebkitBorderBeforeStyle,WebkitBorderBeforeWidth,WebkitBoxReflect,WebkitLineClamp,WebkitMask,WebkitMaskAttachment,WebkitMaskClip,WebkitMaskComposite,WebkitMaskImage,WebkitMaskOrigin,WebkitMaskPosition,WebkitMaskPositionX,WebkitMaskPositionY,WebkitMaskRepeat,WebkitMaskRepeatX,WebkitMaskRepeatY,WebkitMaskSize,WebkitOverflowScrolling,WebkitTapHighlightColor,WebkitTextFillColor,WebkitTextStroke,WebkitTextStrokeColor,WebkitTextStrokeWidth,WebkitTouchCallout,WebkitUserModify,accentColor,alignContent,alignItems,alignSelf,alignTracks,all,animation,animationComposition,animationDelay,animationDirection,animationDuration,animationFillMode,animationIterationCount,animationName,animationPlayState,animationRange,animationRangeEnd,animationRangeStart,animationTimingFunction,animationTimeline,appearance,aspectRatio,azimuth,backdropFilter,backfaceVisibility,background,backgroundAttachment,backgroundBlendMode,backgroundClip,backgroundColor,backgroundImage,backgroundOrigin,backgroundPosition,backgroundPositionX,backgroundPositionY,backgroundRepeat,backgroundSize,blockSize,border,borderBlock,borderBlockColor,borderBlockStyle,borderBlockWidth,borderBlockEnd,borderBlockEndColor,borderBlockEndStyle,borderBlockEndWidth,borderBlockStart,borderBlockStartColor,borderBlockStartStyle,borderBlockStartWidth,borderBottom,borderBottomColor,borderBottomLeftRadius,borderBottomRightRadius,borderBottomStyle,borderBottomWidth,borderCollapse,borderColor,borderEndEndRadius,borderEndStartRadius,borderImage,borderImageOutset,borderImageRepeat,borderImageSlice,borderImageSource,borderImageWidth,borderInline,borderInlineEnd,borderInlineColor,borderInlineStyle,borderInlineWidth,borderInlineEndColor,borderInlineEndStyle,borderInlineEndWidth,borderInlineStart,borderInlineStartColor,borderInlineStartStyle,borderInlineStartWidth,borderLeft,borderLeftColor,borderLeftStyle,borderLeftWidth,borderRadius,borderRight,borderRightColor,borderRightStyle,borderRightWidth,borderSpacing,borderStartEndRadius,borderStartStartRadius,borderStyle,borderTop,borderTopColor,borderTopLeftRadius,borderTopRightRadius,borderTopStyle,borderTopWidth,borderWidth,bottom,boxAlign,boxDecorationBreak,boxDirection,boxFlex,boxFlexGroup,boxLines,boxOrdinalGroup,boxOrient,boxPack,boxShadow,boxSizing,breakAfter,breakBefore,breakInside,captionSide,caret,caretColor,caretShape,clear,clip,clipPath,color,colorScheme,columnCount,columnFill,columnGap,columnRule,columnRuleColor,columnRuleStyle,columnRuleWidth,columnSpan,columnWidth,columns,contain,containIntrinsicSize,containIntrinsicBlockSize,containIntrinsicHeight,containIntrinsicInlineSize,containIntrinsicWidth,container,containerName,containerType,content,contentVisibility,counterIncrement,counterReset,counterSet,cursor,direction,display,emptyCells,filter,flex,flexBasis,flexDirection,flexFlow,flexGrow,flexShrink,flexWrap,float,font,fontFamily,fontFeatureSettings,fontKerning,fontLanguageOverride,fontOpticalSizing,fontPalette,fontVariationSettings,fontSize,fontSizeAdjust,fontSmooth,fontStretch,fontStyle,fontSynthesis,fontSynthesisPosition,fontSynthesisSmallCaps,fontSynthesisStyle,fontSynthesisWeight,fontVariant,fontVariantAlternates,fontVariantCaps,fontVariantEastAsian,fontVariantEmoji,fontVariantLigatures,fontVariantNumeric,fontVariantPosition,fontWeight,forcedColorAdjust,gap,grid,gridArea,gridAutoColumns,gridAutoFlow,gridAutoRows,gridColumn,gridColumnEnd,gridColumnGap,gridColumnStart,gridGap,gridRow,gridRowEnd,gridRowGap,gridRowStart,gridTemplate,gridTemplateAreas,gridTemplateColumns,gridTemplateRows,hangingPunctuation,height,hyphenateCharacter,hyphenateLimitChars,hyphens,imageOrientation,imageRendering,imageResolution,imeMode,initialLetter,initialLetterAlign,inlineSize,inputSecurity,inset,insetBlock,insetBlockEnd,insetBlockStart,insetInline,insetInlineEnd,insetInlineStart,isolation,justifyContent,justifyItems,justifySelf,justifyTracks,left,letterSpacing,lineBreak,lineClamp,lineHeight,lineHeightStep,listStyle,listStyleImage,listStylePosition,listStyleType,margin,marginBlock,marginBlockEnd,marginBlockStart,marginBottom,marginInline,marginInlineEnd,marginInlineStart,marginLeft,marginRight,marginTop,marginTrim,mask,maskBorder,maskBorderMode,maskBorderOutset,maskBorderRepeat,maskBorderSlice,maskBorderSource,maskBorderWidth,maskClip,maskComposite,maskImage,maskMode,maskOrigin,maskPosition,maskRepeat,maskSize,maskType,masonryAutoFlow,mathDepth,mathShift,mathStyle,maxBlockSize,maxHeight,maxInlineSize,maxLines,maxWidth,minBlockSize,minHeight,minInlineSize,minWidth,mixBlendMode,objectFit,objectPosition,offset,offsetAnchor,offsetDistance,offsetPath,offsetPosition,offsetRotate,opacity,order,orphans,outline,outlineColor,outlineOffset,outlineStyle,outlineWidth,overflow,overflowAnchor,overflowBlock,overflowClipBox,overflowClipMargin,overflowInline,overflowWrap,overflowX,overflowY,overlay,overscrollBehavior,overscrollBehaviorBlock,overscrollBehaviorInline,overscrollBehaviorX,overscrollBehaviorY,padding,paddingBlock,paddingBlockEnd,paddingBlockStart,paddingBottom,paddingInline,paddingInlineEnd,paddingInlineStart,paddingLeft,paddingRight,paddingTop,page,pageBreakAfter,pageBreakBefore,pageBreakInside,paintOrder,perspective,perspectiveOrigin,placeContent,placeItems,placeSelf,pointerEvents,position,printColorAdjust,quotes,resize,right,rotate,rowGap,rubyAlign,rubyMerge,rubyPosition,scale,scrollbarColor,scrollbarGutter,scrollbarWidth,scrollBehavior,scrollMargin,scrollMarginBlock,scrollMarginBlockStart,scrollMarginBlockEnd,scrollMarginBottom,scrollMarginInline,scrollMarginInlineStart,scrollMarginInlineEnd,scrollMarginLeft,scrollMarginRight,scrollMarginTop,scrollPadding,scrollPaddingBlock,scrollPaddingBlockStart,scrollPaddingBlockEnd,scrollPaddingBottom,scrollPaddingInline,scrollPaddingInlineStart,scrollPaddingInlineEnd,scrollPaddingLeft,scrollPaddingRight,scrollPaddingTop,scrollSnapAlign,scrollSnapCoordinate,scrollSnapDestination,scrollSnapPointsX,scrollSnapPointsY,scrollSnapStop,scrollSnapType,scrollSnapTypeX,scrollSnapTypeY,scrollTimeline,scrollTimelineAxis,scrollTimelineName,shapeImageThreshold,shapeMargin,shapeOutside,tabSize,tableLayout,textAlign,textAlignLast,textCombineUpright,textDecoration,textDecorationColor,textDecorationLine,textDecorationSkip,textDecorationSkipInk,textDecorationStyle,textDecorationThickness,textEmphasis,textEmphasisColor,textEmphasisPosition,textEmphasisStyle,textIndent,textJustify,textOrientation,textOverflow,textRendering,textShadow,textSizeAdjust,textTransform,textUnderlineOffset,textUnderlinePosition,textWrap,timelineScope,top,touchAction,transform,transformBox,transformOrigin,transformStyle,transition,transitionBehavior,transitionDelay,transitionDuration,transitionProperty,transitionTimingFunction,translate,unicodeBidi,userSelect,verticalAlign,viewTimeline,viewTimelineAxis,viewTimelineInset,viewTimelineName,viewTransitionName,visibility,whiteSpace,whiteSpaceCollapse,widows,width,willChange,wordBreak,wordSpacing,wordWrap,writingMode,zIndex,zoom,alignmentBaseline,baselineShift,clipRule,colorInterpolation,colorRendering,dominantBaseline,fill,fillOpacity,fillRule,floodColor,floodOpacity,glyphOrientationVertical,lightingColor,marker,markerEnd,markerMid,markerStart,shapeRendering,stopColor,stopOpacity,stroke,strokeDasharray,strokeDashoffset,strokeLinecap,strokeLinejoin,strokeMiterlimit,strokeOpacity,strokeWidth,textAnchor,vectorEffect";
var allCssProperties = cssPropertiesStr.split(",").concat(userGenerated);
var properties = new Map(allCssProperties.map((prop) => [prop, true]));
var cssPropertySelectorRegex = /&|@/;
var isCssProperty = /* @__PURE__ */ memo((prop) => {
  return properties.has(prop) || prop.startsWith("--") || cssPropertySelectorRegex.test(prop);
});

// styled-system/jsx/factory-helper.js
var defaultShouldForwardProp = (prop, variantKeys) => !variantKeys.includes(prop) && !isCssProperty(prop);
var composeShouldForwardProps = (tag, shouldForwardProp) => tag.__shouldForwardProps__ && shouldForwardProp ? (propName) => tag.__shouldForwardProps__(propName) && shouldForwardProp(propName) : shouldForwardProp;
var composeCvaFn = (cvaA, cvaB) => {
  if (cvaA && !cvaB) return cvaA;
  if (!cvaA && cvaB) return cvaB;
  if (cvaA.__cva__ && cvaB.__cva__ || cvaA.__recipe__ && cvaB.__recipe__) return cvaA.merge(cvaB);
  const error = new TypeError("Cannot merge cva with recipe. Please use either cva or recipe.");
  TypeError.captureStackTrace?.(error);
  throw error;
};
var getDisplayName = (Component) => {
  if (typeof Component === "string") return Component;
  return Component?.displayName || Component?.name || "Component";
};

// styled-system/jsx/factory.js
function styledFn(Dynamic, configOrCva = {}, options = {}) {
  const cvaFn = configOrCva.__cva__ || configOrCva.__recipe__ ? configOrCva : cva(configOrCva);
  const forwardFn = options.shouldForwardProp || defaultShouldForwardProp;
  const shouldForwardProp = (prop) => forwardFn(prop, cvaFn.variantKeys);
  const defaultProps = Object.assign(
    options.dataAttr && configOrCva.__name__ ? { "data-recipe": configOrCva.__name__ } : {},
    options.defaultProps
  );
  const __cvaFn__ = composeCvaFn(Dynamic.__cva__, cvaFn);
  const __shouldForwardProps__ = composeShouldForwardProps(Dynamic, shouldForwardProp);
  const __base__ = Dynamic.__base__ || Dynamic;
  const StyledComponent = /* @__PURE__ */ forwardRef(function StyledComponent2(props, ref) {
    const { as: Element = __base__, children: children3, ...restProps } = props;
    const combinedProps = useMemo(() => Object.assign({}, defaultProps, restProps), [restProps]);
    const [htmlProps2, forwardedProps, variantProps, styleProps, elementProps] = useMemo(() => {
      return splitProps(combinedProps, normalizeHTMLProps.keys, __shouldForwardProps__, __cvaFn__.variantKeys, isCssProperty);
    }, [combinedProps]);
    function recipeClass() {
      const { css: cssStyles, ...propStyles } = styleProps;
      const compoundVariantStyles = __cvaFn__.__getCompoundVariantCss__?.(variantProps);
      return cx(__cvaFn__(variantProps, false), css(compoundVariantStyles, propStyles, cssStyles), combinedProps.className);
    }
    function cvaClass() {
      const { css: cssStyles, ...propStyles } = styleProps;
      const cvaStyles = __cvaFn__.raw(variantProps);
      return cx(css(cvaStyles, propStyles, cssStyles), combinedProps.className);
    }
    const classes = configOrCva.__recipe__ ? recipeClass : cvaClass;
    return createElement(Element, {
      ref,
      ...forwardedProps,
      ...elementProps,
      ...normalizeHTMLProps(htmlProps2),
      className: classes()
    }, combinedProps.children ?? children3);
  });
  const name = getDisplayName(__base__);
  StyledComponent.displayName = `styled.${name}`;
  StyledComponent.__cva__ = __cvaFn__;
  StyledComponent.__base__ = __base__;
  StyledComponent.__shouldForwardProps__ = shouldForwardProp;
  return StyledComponent;
}
function createJsxFactory() {
  const cache = /* @__PURE__ */ new Map();
  return new Proxy(styledFn, {
    apply(_, __, args) {
      return styledFn(...args);
    },
    get(_, el) {
      if (!cache.has(el)) {
        cache.set(el, styledFn(el));
      }
      return cache.get(el);
    }
  });
}
var styled = /* @__PURE__ */ createJsxFactory();

// styled-system/jsx/box.js
import { createElement as createElement2, forwardRef as forwardRef2 } from "react";

// styled-system/patterns/box.js
var boxConfig = {
  transform(props) {
    return props;
  }
};
var getBoxStyle = (styles = {}) => {
  const _styles = getPatternStyles(boxConfig, styles);
  return boxConfig.transform(_styles, patternFns);
};
var box = (styles) => css(getBoxStyle(styles));
box.raw = getBoxStyle;

// styled-system/jsx/flex.js
import { createElement as createElement3, forwardRef as forwardRef3 } from "react";

// styled-system/patterns/flex.js
var flexConfig = {
  transform(props) {
    const { direction, align, justify, wrap: wrap2, basis, grow, shrink, ...rest } = props;
    return {
      display: "flex",
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap2,
      flexBasis: basis,
      flexGrow: grow,
      flexShrink: shrink,
      ...rest
    };
  }
};
var getFlexStyle = (styles = {}) => {
  const _styles = getPatternStyles(flexConfig, styles);
  return flexConfig.transform(_styles, patternFns);
};
var flex = (styles) => css(getFlexStyle(styles));
flex.raw = getFlexStyle;

// styled-system/jsx/stack.js
import { createElement as createElement4, forwardRef as forwardRef4 } from "react";

// styled-system/patterns/stack.js
var stackConfig = {
  transform(props) {
    const { align, justify, direction, gap, ...rest } = props;
    return {
      display: "flex",
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      gap,
      ...rest
    };
  },
  defaultValues: { direction: "column", gap: "10px" }
};
var getStackStyle = (styles = {}) => {
  const _styles = getPatternStyles(stackConfig, styles);
  return stackConfig.transform(_styles, patternFns);
};
var stack = (styles) => css(getStackStyle(styles));
stack.raw = getStackStyle;

// styled-system/jsx/vstack.js
import { createElement as createElement5, forwardRef as forwardRef5 } from "react";

// styled-system/patterns/vstack.js
var vstackConfig = {
  transform(props) {
    const { justify, gap, ...rest } = props;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      gap,
      flexDirection: "column",
      ...rest
    };
  },
  defaultValues: { gap: "10px" }
};
var getVstackStyle = (styles = {}) => {
  const _styles = getPatternStyles(vstackConfig, styles);
  return vstackConfig.transform(_styles, patternFns);
};
var vstack = (styles) => css(getVstackStyle(styles));
vstack.raw = getVstackStyle;

// styled-system/jsx/hstack.js
import { createElement as createElement6, forwardRef as forwardRef6 } from "react";

// styled-system/patterns/hstack.js
var hstackConfig = {
  transform(props) {
    const { justify, gap, ...rest } = props;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: justify,
      gap,
      flexDirection: "row",
      ...rest
    };
  },
  defaultValues: { gap: "10px" }
};
var getHstackStyle = (styles = {}) => {
  const _styles = getPatternStyles(hstackConfig, styles);
  return hstackConfig.transform(_styles, patternFns);
};
var hstack = (styles) => css(getHstackStyle(styles));
hstack.raw = getHstackStyle;

// styled-system/jsx/spacer.js
import { createElement as createElement7, forwardRef as forwardRef7 } from "react";

// styled-system/patterns/spacer.js
var spacerConfig = {
  transform(props, { map }) {
    const { size, ...rest } = props;
    return {
      alignSelf: "stretch",
      justifySelf: "stretch",
      flex: map(size, (v) => v == null ? "1" : `0 0 ${v}`),
      ...rest
    };
  }
};
var getSpacerStyle = (styles = {}) => {
  const _styles = getPatternStyles(spacerConfig, styles);
  return spacerConfig.transform(_styles, patternFns);
};
var spacer = (styles) => css(getSpacerStyle(styles));
spacer.raw = getSpacerStyle;

// styled-system/jsx/square.js
import { createElement as createElement8, forwardRef as forwardRef8 } from "react";

// styled-system/patterns/square.js
var squareConfig = {
  transform(props) {
    const { size, ...rest } = props;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto",
      width: size,
      height: size,
      ...rest
    };
  }
};
var getSquareStyle = (styles = {}) => {
  const _styles = getPatternStyles(squareConfig, styles);
  return squareConfig.transform(_styles, patternFns);
};
var square = (styles) => css(getSquareStyle(styles));
square.raw = getSquareStyle;

// styled-system/jsx/circle.js
import { createElement as createElement9, forwardRef as forwardRef9 } from "react";

// styled-system/patterns/circle.js
var circleConfig = {
  transform(props) {
    const { size, ...rest } = props;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "0 0 auto",
      width: size,
      height: size,
      borderRadius: "9999px",
      ...rest
    };
  }
};
var getCircleStyle = (styles = {}) => {
  const _styles = getPatternStyles(circleConfig, styles);
  return circleConfig.transform(_styles, patternFns);
};
var circle = (styles) => css(getCircleStyle(styles));
circle.raw = getCircleStyle;

// styled-system/jsx/center.js
import { createElement as createElement10, forwardRef as forwardRef10 } from "react";

// styled-system/patterns/center.js
var centerConfig = {
  transform(props) {
    const { inline, ...rest } = props;
    return {
      display: inline ? "inline-flex" : "flex",
      alignItems: "center",
      justifyContent: "center",
      ...rest
    };
  }
};
var getCenterStyle = (styles = {}) => {
  const _styles = getPatternStyles(centerConfig, styles);
  return centerConfig.transform(_styles, patternFns);
};
var center = (styles) => css(getCenterStyle(styles));
center.raw = getCenterStyle;

// styled-system/jsx/link-overlay.js
import { createElement as createElement11, forwardRef as forwardRef11 } from "react";

// styled-system/patterns/link-overlay.js
var linkOverlayConfig = {
  transform(props) {
    return {
      _before: {
        content: '""',
        position: "absolute",
        inset: "0",
        zIndex: "0",
        ...props["_before"]
      },
      ...props
    };
  }
};
var getLinkOverlayStyle = (styles = {}) => {
  const _styles = getPatternStyles(linkOverlayConfig, styles);
  return linkOverlayConfig.transform(_styles, patternFns);
};
var linkOverlay = (styles) => css(getLinkOverlayStyle(styles));
linkOverlay.raw = getLinkOverlayStyle;

// styled-system/jsx/aspect-ratio.js
import { createElement as createElement12, forwardRef as forwardRef12 } from "react";

// styled-system/patterns/aspect-ratio.js
var aspectRatioConfig = {
  transform(props, { map }) {
    const { ratio = 4 / 3, ...rest } = props;
    return {
      position: "relative",
      _before: {
        content: `""`,
        display: "block",
        height: "0",
        paddingBottom: map(ratio, (r) => `${1 / r * 100}%`)
      },
      "&>*": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%"
      },
      "&>img, &>video": {
        objectFit: "cover"
      },
      ...rest
    };
  }
};
var getAspectRatioStyle = (styles = {}) => {
  const _styles = getPatternStyles(aspectRatioConfig, styles);
  return aspectRatioConfig.transform(_styles, patternFns);
};
var aspectRatio = (styles) => css(getAspectRatioStyle(styles));
aspectRatio.raw = getAspectRatioStyle;

// styled-system/jsx/grid.js
import { createElement as createElement13, forwardRef as forwardRef13 } from "react";

// styled-system/patterns/grid.js
var gridConfig = {
  transform(props, { map, isCssUnit: isCssUnit2 }) {
    const { columnGap, rowGap, gap, columns, minChildWidth, ...rest } = props;
    const getValue = (v) => isCssUnit2(v) ? v : `token(sizes.${v}, ${v})`;
    return {
      display: "grid",
      gridTemplateColumns: columns != null ? map(columns, (v) => `repeat(${v}, minmax(0, 1fr))`) : minChildWidth != null ? map(minChildWidth, (v) => `repeat(auto-fit, minmax(${getValue(v)}, 1fr))`) : void 0,
      gap,
      columnGap,
      rowGap,
      ...rest
    };
  },
  defaultValues(props) {
    return { gap: props.columnGap || props.rowGap ? void 0 : "10px" };
  }
};
var getGridStyle = (styles = {}) => {
  const _styles = getPatternStyles(gridConfig, styles);
  return gridConfig.transform(_styles, patternFns);
};
var grid = (styles) => css(getGridStyle(styles));
grid.raw = getGridStyle;

// styled-system/jsx/grid-item.js
import { createElement as createElement14, forwardRef as forwardRef14 } from "react";

// styled-system/patterns/grid-item.js
var gridItemConfig = {
  transform(props, { map }) {
    const { colSpan, rowSpan, colStart, rowStart, colEnd, rowEnd, ...rest } = props;
    const spanFn = (v) => v === "auto" ? v : `span ${v}`;
    return {
      gridColumn: colSpan != null ? map(colSpan, spanFn) : void 0,
      gridRow: rowSpan != null ? map(rowSpan, spanFn) : void 0,
      gridColumnStart: colStart,
      gridColumnEnd: colEnd,
      gridRowStart: rowStart,
      gridRowEnd: rowEnd,
      ...rest
    };
  }
};
var getGridItemStyle = (styles = {}) => {
  const _styles = getPatternStyles(gridItemConfig, styles);
  return gridItemConfig.transform(_styles, patternFns);
};
var gridItem = (styles) => css(getGridItemStyle(styles));
gridItem.raw = getGridItemStyle;

// styled-system/jsx/wrap.js
import { createElement as createElement15, forwardRef as forwardRef15 } from "react";

// styled-system/patterns/wrap.js
var wrapConfig = {
  transform(props) {
    const { columnGap, rowGap, gap = columnGap || rowGap ? void 0 : "10px", align, justify, ...rest } = props;
    return {
      display: "flex",
      flexWrap: "wrap",
      alignItems: align,
      justifyContent: justify,
      gap,
      columnGap,
      rowGap,
      ...rest
    };
  }
};
var getWrapStyle = (styles = {}) => {
  const _styles = getPatternStyles(wrapConfig, styles);
  return wrapConfig.transform(_styles, patternFns);
};
var wrap = (styles) => css(getWrapStyle(styles));
wrap.raw = getWrapStyle;

// styled-system/jsx/container.js
import { createElement as createElement16, forwardRef as forwardRef16 } from "react";

// styled-system/patterns/container.js
var containerConfig = {
  transform(props) {
    return {
      position: "relative",
      maxWidth: "8xl",
      mx: "auto",
      px: { base: "4", md: "6", lg: "8" },
      ...props
    };
  }
};
var getContainerStyle = (styles = {}) => {
  const _styles = getPatternStyles(containerConfig, styles);
  return containerConfig.transform(_styles, patternFns);
};
var container = (styles) => css(getContainerStyle(styles));
container.raw = getContainerStyle;

// styled-system/jsx/divider.js
import { createElement as createElement17, forwardRef as forwardRef17 } from "react";

// styled-system/patterns/divider.js
var dividerConfig = {
  transform(props, { map }) {
    const { orientation, thickness, color, ...rest } = props;
    return {
      "--thickness": thickness,
      width: map(orientation, (v) => v === "vertical" ? void 0 : "100%"),
      height: map(orientation, (v) => v === "horizontal" ? void 0 : "100%"),
      borderBlockEndWidth: map(orientation, (v) => v === "horizontal" ? "var(--thickness)" : void 0),
      borderInlineEndWidth: map(orientation, (v) => v === "vertical" ? "var(--thickness)" : void 0),
      borderColor: color,
      ...rest
    };
  },
  defaultValues: { orientation: "horizontal", thickness: "1px" }
};
var getDividerStyle = (styles = {}) => {
  const _styles = getPatternStyles(dividerConfig, styles);
  return dividerConfig.transform(_styles, patternFns);
};
var divider = (styles) => css(getDividerStyle(styles));
divider.raw = getDividerStyle;

// styled-system/jsx/float.js
import { createElement as createElement18, forwardRef as forwardRef18 } from "react";

// styled-system/patterns/float.js
var floatConfig = {
  transform(props, { map }) {
    const { offset, offsetX, offsetY, placement, ...rest } = props;
    return {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      insetBlockStart: map(placement, (v) => {
        const [side] = v.split("-");
        const map2 = { top: offsetY, middle: "50%", bottom: "auto" };
        return map2[side];
      }),
      insetBlockEnd: map(placement, (v) => {
        const [side] = v.split("-");
        const map2 = { top: "auto", middle: "50%", bottom: offsetY };
        return map2[side];
      }),
      insetInlineStart: map(placement, (v) => {
        const [, align] = v.split("-");
        const map2 = { start: offsetX, center: "50%", end: "auto" };
        return map2[align];
      }),
      insetInlineEnd: map(placement, (v) => {
        const [, align] = v.split("-");
        const map2 = { start: "auto", center: "50%", end: offsetX };
        return map2[align];
      }),
      translate: map(placement, (v) => {
        const [side, align] = v.split("-");
        const mapX = { start: "-50%", center: "-50%", end: "50%" };
        const mapY = { top: "-50%", middle: "-50%", bottom: "50%" };
        return `${mapX[align]} ${mapY[side]}`;
      }),
      ...rest
    };
  },
  defaultValues(props) {
    const offset = props.offset || "0";
    return { offset, offsetX: offset, offsetY: offset, placement: "top-end" };
  }
};
var getFloatStyle = (styles = {}) => {
  const _styles = getPatternStyles(floatConfig, styles);
  return floatConfig.transform(_styles, patternFns);
};
var float = (styles) => css(getFloatStyle(styles));
float.raw = getFloatStyle;

// styled-system/jsx/bleed.js
import { createElement as createElement19, forwardRef as forwardRef19 } from "react";

// styled-system/patterns/bleed.js
var bleedConfig = {
  transform(props, { map, isCssUnit: isCssUnit2, isCssVar: isCssVar2 }) {
    const { inline, block, ...rest } = props;
    const valueFn = (v) => isCssUnit2(v) || isCssVar2(v) ? v : `token(spacing.${v}, ${v})`;
    return {
      "--bleed-x": map(inline, valueFn),
      "--bleed-y": map(block, valueFn),
      marginInline: "calc(var(--bleed-x, 0) * -1)",
      marginBlock: "calc(var(--bleed-y, 0) * -1)",
      ...rest
    };
  },
  defaultValues: { inline: "0", block: "0" }
};
var getBleedStyle = (styles = {}) => {
  const _styles = getPatternStyles(bleedConfig, styles);
  return bleedConfig.transform(_styles, patternFns);
};
var bleed = (styles) => css(getBleedStyle(styles));
bleed.raw = getBleedStyle;

// styled-system/jsx/visually-hidden.js
import { createElement as createElement20, forwardRef as forwardRef20 } from "react";

// styled-system/patterns/visually-hidden.js
var visuallyHiddenConfig = {
  transform(props) {
    return {
      srOnly: true,
      ...props
    };
  }
};
var getVisuallyHiddenStyle = (styles = {}) => {
  const _styles = getPatternStyles(visuallyHiddenConfig, styles);
  return visuallyHiddenConfig.transform(_styles, patternFns);
};
var visuallyHidden = (styles) => css(getVisuallyHiddenStyle(styles));
visuallyHidden.raw = getVisuallyHiddenStyle;

// styled-system/jsx/cq.js
import { createElement as createElement21, forwardRef as forwardRef21 } from "react";

// styled-system/patterns/cq.js
var cqConfig = {
  transform(props) {
    const { name, type, ...rest } = props;
    return {
      containerType: type,
      containerName: name,
      ...rest
    };
  },
  defaultValues: { type: "inline-size" }
};
var getCqStyle = (styles = {}) => {
  const _styles = getPatternStyles(cqConfig, styles);
  return cqConfig.transform(_styles, patternFns);
};
var cq = (styles) => css(getCqStyle(styles));
cq.raw = getCqStyle;

// components/button.tsx
import { Button as RAButton } from "react-aria-components";
var buttonStyle = cva({
  base: {
    bg: "transparent",
    border: "none",
    cursor: "default",
    transition: "all 0.1s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textStyle: "button"
  },
  variants: {
    variant: {
      default: {
        bg: "prometheus",
        color: "black",
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8"
        },
        _focusVisible: {
          ringColor: "background2",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px"
        }
      },
      outline: {
        border: "2px solid",
        borderColor: "background2",
        color: { base: "black", _dark: "white" },
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8"
        },
        bg: "background",
        _focusVisible: {
          ringColor: "prometheus",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px"
        }
      },
      success: {
        bg: "emerald.400",
        color: "white",
        _focusVisible: {
          ringColor: "background",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px"
        }
      },
      destruct: {
        bg: "red.700",
        color: "white",
        _focusVisible: {
          ringColor: "background",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px"
        }
      },
      ghost: {
        color: { base: "black", _dark: "white" },
        opacity: {
          base: "1",
          _disabled: { base: "0.5", _hover: "0.5" },
          _hover: "0.8"
        },
        bg: {
          base: "transparent",
          _disabled: { _hover: "transparent" },
          _hover: "background2Dim"
        },
        _focusVisible: {
          ringColor: "prometheus",
          outline: "none",
          ring: "2px solid",
          ringOffset: "-4px"
        }
      }
    },
    size: {
      default: {
        p: "4"
      },
      icon: {
        p: "1"
      },
      sm: {
        p: "2"
      },
      lg: {
        p: "6",
        fontSize: "xl"
      }
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});
var Button = styled(RAButton, buttonStyle);

// context.tsx
import { createContext, useContext } from "react";

// ../api/dist/index.js
var _serialize = (name, value, opt = {}) => {
  let cookie = `${name}=${value}`;
  if (name.startsWith("__Secure-") && !opt.secure) {
    throw new Error("__Secure- Cookie must have Secure attributes");
  }
  if (name.startsWith("__Host-")) {
    if (!opt.secure) {
      throw new Error("__Host- Cookie must have Secure attributes");
    }
    if (opt.path !== "/") {
      throw new Error('__Host- Cookie must have Path attributes with "/"');
    }
    if (opt.domain) {
      throw new Error("__Host- Cookie must not have Domain attributes");
    }
  }
  if (opt && typeof opt.maxAge === "number" && opt.maxAge >= 0) {
    if (opt.maxAge > 3456e4) {
      throw new Error(
        "Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration."
      );
    }
    cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
  }
  if (opt.domain && opt.prefix !== "host") {
    cookie += `; Domain=${opt.domain}`;
  }
  if (opt.path) {
    cookie += `; Path=${opt.path}`;
  }
  if (opt.expires) {
    if (opt.expires.getTime() - Date.now() > 3456e7) {
      throw new Error(
        "Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future."
      );
    }
    cookie += `; Expires=${opt.expires.toUTCString()}`;
  }
  if (opt.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (opt.secure) {
    cookie += "; Secure";
  }
  if (opt.sameSite) {
    cookie += `; SameSite=${opt.sameSite.charAt(0).toUpperCase() + opt.sameSite.slice(1)}`;
  }
  if (opt.partitioned) {
    if (!opt.secure) {
      throw new Error("Partitioned Cookie must have Secure attributes");
    }
    cookie += "; Partitioned";
  }
  return cookie;
};
var serialize = (name, value, opt) => {
  value = encodeURIComponent(value);
  return _serialize(name, value, opt);
};
var mergePath = (base, path) => {
  base = base.replace(/\/+$/, "");
  base = base + "/";
  path = path.replace(/^\/+/, "");
  return base + path;
};
var replaceUrlParam = (urlString, params) => {
  for (const [k, v] of Object.entries(params)) {
    const reg = new RegExp("/:" + k + "(?:{[^/]+})?");
    urlString = urlString.replace(reg, `/${v}`);
  }
  return urlString;
};
var replaceUrlProtocol = (urlString, protocol) => {
  switch (protocol) {
    case "ws":
      return urlString.replace(/^http/, "ws");
    case "http":
      return urlString.replace(/^ws/, "http");
  }
};
var removeIndexString = (urlSting) => {
  if (/^https?:\/\/[^\/]+?\/index$/.test(urlSting)) {
    return urlSting.replace(/\/index$/, "/");
  }
  return urlSting.replace(/\/index$/, "");
};
function isObject2(item) {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}
function deepMerge(target, source) {
  if (!isObject2(target) && !isObject2(source)) {
    return source;
  }
  const merged = { ...target };
  for (const key in source) {
    const value = source[key];
    if (isObject2(merged[key]) && isObject2(value)) {
      merged[key] = deepMerge(merged[key], value);
    } else {
      merged[key] = value;
    }
  }
  return merged;
}
var createProxy = (callback, path) => {
  const proxy = new Proxy(() => {
  }, {
    get(_obj, key) {
      if (typeof key !== "string" || key === "then") {
        return void 0;
      }
      return createProxy(callback, [...path, key]);
    },
    apply(_1, _2, args) {
      return callback({
        path,
        args
      });
    }
  });
  return proxy;
};
var ClientRequestImpl = class {
  url;
  method;
  queryParams = void 0;
  pathParams = {};
  rBody;
  cType = void 0;
  constructor(url, method) {
    this.url = url;
    this.method = method;
  }
  fetch = async (args, opt) => {
    if (args) {
      if (args.query) {
        for (const [k, v] of Object.entries(args.query)) {
          if (v === void 0) {
            continue;
          }
          this.queryParams ||= new URLSearchParams();
          if (Array.isArray(v)) {
            for (const v2 of v) {
              this.queryParams.append(k, v2);
            }
          } else {
            this.queryParams.set(k, v);
          }
        }
      }
      if (args.form) {
        const form = new FormData();
        for (const [k, v] of Object.entries(args.form)) {
          if (Array.isArray(v)) {
            for (const v2 of v) {
              form.append(k, v2);
            }
          } else {
            form.append(k, v);
          }
        }
        this.rBody = form;
      }
      if (args.json) {
        this.rBody = JSON.stringify(args.json);
        this.cType = "application/json";
      }
      if (args.param) {
        this.pathParams = args.param;
      }
    }
    let methodUpperCase = this.method.toUpperCase();
    const headerValues = {
      ...args?.header ?? {},
      ...typeof opt?.headers === "function" ? await opt.headers() : opt?.headers ? opt.headers : {}
    };
    if (args?.cookie) {
      const cookies = [];
      for (const [key, value] of Object.entries(args.cookie)) {
        cookies.push(serialize(key, value, { path: "/" }));
      }
      headerValues["Cookie"] = cookies.join(",");
    }
    if (this.cType) {
      headerValues["Content-Type"] = this.cType;
    }
    const headers = new Headers(headerValues ?? void 0);
    let url = this.url;
    url = removeIndexString(url);
    url = replaceUrlParam(url, this.pathParams);
    if (this.queryParams) {
      url = url + "?" + this.queryParams.toString();
    }
    methodUpperCase = this.method.toUpperCase();
    const setBody = !(methodUpperCase === "GET" || methodUpperCase === "HEAD");
    return (opt?.fetch || fetch)(url, {
      body: setBody ? this.rBody : void 0,
      method: methodUpperCase,
      headers,
      ...opt?.init
    });
  };
};
var hc = (baseUrl, options) => createProxy(function proxyCallback(opts) {
  const parts = [...opts.path];
  if (parts[parts.length - 1] === "toString") {
    if (parts[parts.length - 2] === "name") {
      return parts[parts.length - 3] || "";
    }
    return proxyCallback.toString();
  }
  if (parts[parts.length - 1] === "valueOf") {
    if (parts[parts.length - 2] === "name") {
      return parts[parts.length - 3] || "";
    }
    return proxyCallback;
  }
  let method = "";
  if (/^\$/.test(parts[parts.length - 1])) {
    const last = parts.pop();
    if (last) {
      method = last.replace(/^\$/, "");
    }
  }
  const path = parts.join("/");
  const url = mergePath(baseUrl, path);
  if (method === "url") {
    if (opts.args[0] && opts.args[0].param) {
      return new URL(replaceUrlParam(url, opts.args[0].param));
    }
    return new URL(url);
  }
  if (method === "ws") {
    const webSocketUrl = replaceUrlProtocol(
      opts.args[0] && opts.args[0].param ? replaceUrlParam(url, opts.args[0].param) : url,
      "ws"
    );
    const targetUrl = new URL(webSocketUrl);
    for (const key in opts.args[0]?.query) {
      targetUrl.searchParams.set(key, opts.args[0].query[key]);
    }
    return new WebSocket(targetUrl.toString());
  }
  const req = new ClientRequestImpl(url, method);
  if (method) {
    options ??= {};
    const args = deepMerge(options, { ...opts.args[1] ?? {} });
    return req.fetch(opts.args[0], args);
  }
  return req;
}, []);
var AUTH_URL = "https://au4npvybqaat5pevzokapvitmu0dmoam.lambda-url.us-east-1.on.aws";
var APIClient = class {
  apiEndpoint;
  honoClient;
  key;
  getToken;
  orgId;
  spaceId;
  environmentId;
  constructor(options) {
    this.key = options?.key;
    this.apiEndpoint = "https://api.vestia.dev";
    this.orgId = options?.orgId;
    this.spaceId = options?.spaceId;
    this.environmentId = options?.environmentId;
    if (options?.getToken) {
      this.getToken = options.getToken;
    } else {
      this.getToken = () => options?.key;
    }
    const headers = {};
    const jwt = this.key || this.getToken();
    if (jwt) {
      headers["authorization"] = jwt;
    }
    this.honoClient = hc(this.apiEndpoint, {
      headers
    });
  }
  async request(name, fn, oseParams) {
    let validOSEParams = {};
    if (oseParams) {
      Object.entries(oseParams).forEach(([key, value]) => {
        if (key === "orgId" || key === "spaceId" || key === "environmentId") {
          if (!value) {
            if (!this[key]) {
              throw Error(`Missing parameter: ${key} for query: ${name} `);
            } else {
              validOSEParams = {
                ...validOSEParams,
                [key]: encodeURIComponent(this[key])
              };
            }
          } else {
            validOSEParams = {
              ...validOSEParams,
              [key]: encodeURIComponent(value)
            };
          }
        }
      });
    }
    const res = await fn(this.honoClient, validOSEParams);
    if (!res.ok) {
      console.error(
        `Error from API call ${name}: ${res.status} ${res.statusText}`
      );
      return null;
    }
    return res.json();
  }
};
var StudioClient = class extends APIClient {
  async getUser() {
    return this.request("getUser", (client) => client.user.$get());
  }
  async updateUser({ displayName }) {
    return this.request(
      "updateUser",
      (client) => client.user.$put({
        json: {
          displayName
        }
      })
    );
  }
  async getUserInvites() {
    return this.request(
      "getUserInvites",
      (client) => client.user.invites.$get()
    );
  }
  async handleInviteToOrg({
    orgId,
    accepted
  }) {
    return await this.request(
      "handleInviteToOrg",
      (client, validOSEParams) => client.user.invites.$put({
        json: {
          accepted,
          ...validOSEParams
        }
      }),
      { orgId }
    );
  }
  async createOrgWithUser({
    displayName,
    orgId,
    email
  }) {
    return this.request(
      "createOrgWithUser",
      (client, validOSEParams) => client.orgs.$post({
        json: {
          displayName,
          email,
          ...validOSEParams
        }
      }),
      { orgId }
    );
  }
  async getOrg({ orgId }) {
    return this.request(
      "getOrg",
      (client, validOSEParams) => client.orgs[":orgId"].$get({
        param: validOSEParams
      }),
      { orgId }
    );
  }
  async updateOrgDisplayName({
    displayName,
    orgId
  }) {
    return this.request(
      "updateOrgDisplayName",
      (client, validOSEParams) => client.orgs[":orgId"].$put({
        param: validOSEParams,
        json: { displayName }
      }),
      { orgId }
    );
  }
  async removeOrg({ orgId }) {
    return this.request(
      "removeOrg",
      (client, validOSEParams) => client.orgs[":orgId"].$delete({
        param: validOSEParams
      }),
      { orgId }
    );
  }
  async getOrgUsersAndInvites({ orgId }) {
    return this.request(
      "getOrgUsersAndInvites",
      (client, validOSEParams) => client.orgs[":orgId"].users.$get({
        param: validOSEParams
      }),
      { orgId }
    );
  }
  async getSpaces({ orgId }) {
    return this.request(
      "getSpaces",
      (client, validOSEParams) => client.orgs[":orgId"].spaces.$get({
        param: validOSEParams
      }),
      { orgId }
    );
  }
  async getSpace({ orgId, spaceId }) {
    return this.request(
      "getSpace",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].$get({
        param: validOSEParams
      }),
      { orgId, spaceId }
    );
  }
  async inviteUserToOrg({ orgId, email }) {
    return this.request(
      "inviteUserToOrg",
      (client, validOSEParams) => client.orgs[":orgId"].invites.$post({
        param: validOSEParams,
        json: { email }
      }),
      { orgId }
    );
  }
  async createSpace({
    orgId,
    spaceId,
    displayName,
    environments
  }) {
    return this.request(
      "createSpace",
      (client, validOSEParams) => client.orgs[":orgId"].spaces.$post({
        param: validOSEParams,
        json: { ...validOSEParams, displayName, environments }
      }),
      { orgId, spaceId }
    );
  }
  async removeSpace({ orgId, spaceId }) {
    return this.request(
      "removeSpace",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].$delete({
        param: validOSEParams
      }),
      { orgId, spaceId }
    );
  }
  async createEnvironment({
    orgId,
    spaceId,
    environmentId
  }) {
    return this.request(
      "createEnvironment",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments.$post({
        param: validOSEParams,
        json: validOSEParams
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async removeEnvironment({
    orgId,
    spaceId,
    environmentId
  }) {
    return this.request(
      "removeEnvironment",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].$delete({
        param: validOSEParams
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async getAPIKeys({ orgId, spaceId }) {
    return this.request(
      "getAPIKeys",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].keys.$get({
        param: validOSEParams
      }),
      { orgId, spaceId }
    );
  }
  async createAPIKey({
    orgId,
    spaceId,
    environmentId,
    displayName
  }) {
    return this.request(
      "createAPIKey",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].keys.$post({
        param: validOSEParams,
        json: { displayName }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async removeAPIKey({
    orgId,
    spaceId,
    environmentId,
    keyId
  }) {
    return this.request(
      "removeAPIKey",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].keys[":keyId"].$delete({
        param: { keyId: encodeURIComponent(keyId), ...validOSEParams }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async createContent({
    orgId,
    spaceId,
    environmentId,
    displayName,
    contentId,
    previewLayout
  }) {
    return this.request(
      "createContent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content.$post({
        param: { ...validOSEParams },
        json: { displayName, contentId, previewLayout }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async getContentById({
    orgId,
    spaceId,
    environmentId,
    contentId
  }) {
    return this.request(
      "getContentById",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].$get({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async getPublishedContentById({
    orgId,
    spaceId,
    environmentId,
    contentId
  }) {
    return this.request(
      "getContentById",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].published.$get({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async getContentByPrefix({
    orgId,
    spaceId,
    environmentId,
    prefix
  }) {
    return this.request(
      "getContentByPrefix",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content.$get({
        param: { ...validOSEParams },
        query: { prefix }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async updateComponentOrder({
    orgId,
    spaceId,
    environmentId,
    contentId,
    componentOrder
  }) {
    return this.request(
      "updateComponentOrder",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"]["component-order"].$put({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        },
        json: { componentOrder }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async updatePreviewLayout({
    orgId,
    spaceId,
    environmentId,
    contentId,
    previewLayout
  }) {
    return this.request(
      "updateComponentOrder",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"]["preview-layout"].$put({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        },
        json: { previewLayout }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async publishContent({
    orgId,
    spaceId,
    environmentId,
    contentId
  }) {
    return this.request(
      "publishContent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content.publish.$post({
        param: { ...validOSEParams },
        json: { contentId }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async removeContent({
    orgId,
    spaceId,
    environmentId,
    contentId
  }) {
    return this.request(
      "removeContent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].$delete({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async batchRemoveContent({
    orgId,
    spaceId,
    environmentId,
    contentIds
  }) {
    return this.request(
      "batchRemoveContent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content["batch-remove"].$post({
        param: { ...validOSEParams },
        json: { contentIds }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async createComponent({
    orgId,
    spaceId,
    environmentId,
    contentId,
    type,
    displayName,
    controls,
    position
  }) {
    return this.request(
      "createComponent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].components.$post({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        },
        json: { type, displayName, controls, position }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async getComponentsByContentId({
    orgId,
    spaceId,
    environmentId,
    contentId
  }) {
    return this.request(
      "getComponentsByContentId",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].components.$get({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId)
        }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async updateComponent({
    orgId,
    spaceId,
    environmentId,
    contentId,
    componentId,
    displayName,
    controls
  }) {
    return this.request(
      "updateComponent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].components[":componentId"].$put({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId),
          componentId: encodeURIComponent(componentId)
        },
        json: { displayName, controls }
      }),
      { orgId, spaceId, environmentId }
    );
  }
  async removeComponent({
    orgId,
    spaceId,
    environmentId,
    contentId,
    componentId
  }) {
    return this.request(
      "removeComponent",
      (client, validOSEParams) => client.orgs[":orgId"].spaces[":spaceId"].environments[":environmentId"].content[":contentId"].components[":componentId"].$delete({
        param: {
          ...validOSEParams,
          contentId: encodeURIComponent(contentId),
          componentId: encodeURIComponent(componentId)
        }
      }),
      { orgId, spaceId, environmentId }
    );
  }
};

// context.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// utils.ts
import { useEffect } from "react";

// auth.ts
var AUTH_COOKIE_NAME = "vestia_auth_token";
var authHandler = async ({
  request,
  redirectPaths,
  basePath = "/auth"
}) => {
  const { searchParams, origin, pathname } = new URL(request.url);
  if (pathname === `${basePath}/callback`) {
    const code = searchParams.get("code");
    if (code) {
      const tokenResponse = await fetch(`${AUTH_URL}/token`, {
        method: "POST",
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: "client",
          code,
          redirect_uri: `${origin}${basePath}/callback`
        })
      });
      if (tokenResponse.ok) {
        const { access_token } = await tokenResponse.json();
        return new Response(null, {
          status: 303,
          headers: {
            Location: redirectPaths.login,
            "Set-Cookie": `${AUTH_COOKIE_NAME}=${access_token}; Path=/; Max-Age=2592000`
          }
        });
      } else {
        return new Response(null, {
          status: 303,
          headers: {
            Location: redirectPaths.error
          }
        });
      }
    }
  } else if (pathname === `${basePath}/logout`) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: redirectPaths.logout,
        "Set-Cookie": `${AUTH_COOKIE_NAME}=null; Path=/; Max-Age=0`
      }
    });
  }
  return new Response(null, {
    status: 303,
    headers: {
      Location: redirectPaths.fallback
    }
  });
};

// utils.ts
var getCookie = (name) => {
  if (typeof document !== "undefined") {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((cookie2) => cookie2.startsWith(`${name}=`));
    if (cookie) {
      const [name2, value] = cookie.split("=");
      return { name: name2, value };
    }
  }
};
var getToken = () => {
  const cookie = getCookie(AUTH_COOKIE_NAME);
  if (cookie) {
    return cookie.value;
  }
};
var useTokenCheck = () => {
  const token = getToken();
  const paths = usePaths();
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate(paths.login, void 0);
    }
  }, []);
  return null;
};
function move(key, keys, components, dropPosition) {
  if (!components) {
    return [];
  }
  let toIndex = components.findIndex((item) => item.componentId === key);
  if (toIndex === -1) {
    return components;
  }
  toIndex = dropPosition === "before" ? toIndex : toIndex + 1;
  let keyArray = Array.isArray(keys) ? keys : [...keys];
  let indices = keyArray.map((key2) => components.findIndex((item) => item.componentId === key2)).sort((a, b) => a - b);
  toIndex -= indices.filter((index) => index < toIndex).length;
  let moves = indices.map((from) => ({
    from,
    to: toIndex++
  }));
  for (let i = 0; i < moves.length; i++) {
    const moveA = moves[i];
    if (moveA) {
      for (let j = i + 1; j < moves.length; j++) {
        const moveB = moves[j];
        if (moveB && moveB.from > moveA.from) {
          moveB.from--;
        }
      }
    }
  }
  for (let i = 0; i < moves.length; i++) {
    const moveA = moves[i];
    if (moveA) {
      for (let j = moves.length - 1; j > i; j--) {
        const moveB = moves[j];
        if (moveB) {
          if (moveB.from < moveA.to) {
            moveA.to++;
          } else {
            moveB.from++;
          }
        }
      }
    }
  }
  let copy = components.slice();
  for (const move2 of moves) {
    if (move2.from >= 0 && move2.from < copy.length) {
      const [item] = copy.splice(move2.from, 1);
      if (item && move2.to >= 0 && move2.to <= copy.length) {
        copy.splice(move2.to, 0, item);
      }
    }
  }
  return copy;
}

// context.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
var VestiaContext = createContext(void 0);
var queryClient = new QueryClient();
var VestiaProvider = ({
  config,
  children: children3
}) => {
  if (!config.orgId) {
    throw new Error("You must provide an orgId");
  }
  if (!config.spaceId) {
    throw new Error("You must provide a spaceId");
  }
  if (!config.environmentId) {
    throw new Error("You must provide an environmentId");
  }
  const studioClient = new StudioClient({
    orgId: config.orgId,
    spaceId: config.spaceId,
    environmentId: config.environmentId,
    getToken
  });
  const defaultPaths = {
    basePath: "/studio",
    login: "/login",
    auth: "/auth",
    content: "/content",
    flags: "/flags",
    experiments: "/experiments",
    forms: "/forms",
    assets: "/assets"
  };
  const paths = config.paths ? { ...defaultPaths, ...config.paths } : defaultPaths;
  const mappedPaths = Object.keys(paths).reduce((acc, key) => {
    return {
      ...acc,
      [key]: key !== "basePath" ? `${paths["basePath"]}${paths[key]}` : paths[key]
    };
  }, defaultPaths);
  return /* @__PURE__ */ jsx2(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx2(
    VestiaContext.Provider,
    {
      value: {
        config: { ...config, paths: mappedPaths },
        client: studioClient
      },
      children: children3
    }
  ) });
};
var useConfig = () => {
  const context2 = useContext(VestiaContext);
  if (!context2) {
    throw new Error("useConfig must be used within a VestiaProvider");
  }
  return context2.config;
};
var useStudioClient = () => {
  const context2 = useContext(VestiaContext);
  if (!context2) {
    throw new Error("useStudioClient must be used within a VestiaProvider");
  }
  return context2.client;
};
var usePaths = () => {
  const { paths } = useConfig();
  return paths;
};
var useNavigate = () => {
  const {
    routing: { navigate }
  } = useConfig();
  return navigate;
};
var useSearchParams = () => {
  const {
    routing: { useSearchParams: useSearchParams2 }
  } = useConfig();
  return useSearchParams2();
};
var useParams = () => {
  const {
    routing: { useParams: useParams2 }
  } = useConfig();
  return useParams2();
};
var useComponents = () => {
  const { components } = useConfig();
  return components;
};
var useLayouts = () => {
  const { layouts } = useConfig();
  return layouts;
};

// components/side-nav.tsx
import { useQuery } from "@tanstack/react-query";

// components/menu.tsx
import {
  Menu as RAMenu,
  MenuTrigger as RAMenuTrigger,
  Popover as RAPopover,
  MenuItem as RAMenuItem
} from "react-aria-components";
import "react";
import "lucide-react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var Menu = ({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsxs2(RAMenuTrigger, { children: [
    props.buttonSlot,
    /* @__PURE__ */ jsx3(RAPopover, { offset: props.offset, crossOffset: props.crossOffset, children: /* @__PURE__ */ jsx3(
      RAMenu,
      {
        className: css({
          display: "flex",
          flexDirection: "column",
          border: "2px solid",
          bg: "background2",
          borderColor: "background2",
          borderRadius: "default",
          w: "52",
          _focusVisible: {
            outline: "none"
          }
        }),
        ...props,
        children: props.children
      }
    ) })
  ] });
};
var MenuItemIcon = ({ name }) => /* @__PURE__ */ jsx3(icon_default, { name });
var MenuItem = ({
  className,
  external = false,
  href: href2,
  ...props
}) => {
  return /* @__PURE__ */ jsx3(
    RAMenuItem,
    {
      className: css({
        display: "flex",
        p: "2",
        gap: "2",
        alignItems: "center",
        _focusVisible: {
          outline: "none",
          bg: "backgroundDim"
        },
        textStyle: "body",
        color: "text",
        cursor: "default",
        bg: "background",
        _hover: {
          bg: "backgroundDim"
        }
      }),
      href: external ? void 0 : href2,
      onAction: external ? () => {
        if (external) {
          window.open(href2);
        }
      } : void 0,
      ...props,
      children: props.children
    }
  );
};

// components/side-nav.tsx
import { Fragment, jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
var UserMenu = ({
  user
}) => {
  const { auth } = usePaths();
  return /* @__PURE__ */ jsxs3(
    Menu,
    {
      offset: 20,
      buttonSlot: /* @__PURE__ */ jsx4(
        RAButton2,
        {
          className: css({
            cursor: "default",
            backgroundColor: "transparent",
            backgroundImage: "none",
            borderWidth: 0,
            padding: 0,
            maxHeight: "30px",
            _hover: {
              opacity: 0.8
            },
            _focusVisible: {
              outline: "none",
              ring: "2px solid",
              ringColor: "prometheus",
              ringOffset: "-2px"
            }
          }),
          children: /* @__PURE__ */ jsx4(
            "img",
            {
              src: user.pictureUrl,
              className: css({
                maxWidth: "30px",
                borderRadius: "50%"
              })
            }
          )
        }
      ),
      children: [
        /* @__PURE__ */ jsxs3(MenuItem, { href: "https://docs.vestia.dev/", id: "docs", external: true, children: [
          /* @__PURE__ */ jsx4(MenuItemIcon, { name: "BookText" }),
          /* @__PURE__ */ jsx4("span", { children: "Docs" })
        ] }),
        /* @__PURE__ */ jsxs3(MenuItem, { href: `${auth}/logout`, id: "logout", children: [
          /* @__PURE__ */ jsx4(MenuItemIcon, { name: "LogOut" }),
          /* @__PURE__ */ jsx4("span", { children: "Log out" })
        ] })
      ]
    }
  );
};
var Container = ({
  path,
  children: children3
}) => {
  useTokenCheck();
  const [open, setOpen] = useState(true);
  const studioClient = useStudioClient();
  const config = useConfig();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => await studioClient.getUser()
  });
  const { basePath } = usePaths();
  const withoutBasePath = path.split(basePath);
  const activeTab = withoutBasePath.length > 1 ? withoutBasePath[1]?.split("/")[1] : withoutBasePath[0]?.split("/")[1];
  return /* @__PURE__ */ jsxs3(
    "aside",
    {
      "data-open": open,
      className: css({
        textStyle: "body",
        _open: {
          minWidth: "200px"
        },
        minWidth: "60px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        bg: "background2",
        containerType: "inline-size",
        borderLeft: "2px solid",
        borderRight: "2px solid",
        borderColor: "background2"
      }),
      children: [
        /* @__PURE__ */ jsxs3(
          "div",
          {
            className: css({
              width: "100%"
            }),
            children: [
              /* @__PURE__ */ jsx4(Section, { children: /* @__PURE__ */ jsxs3(
                "span",
                {
                  className: css({
                    display: "flex",
                    gap: "2",
                    alignItems: "center"
                  }),
                  children: [
                    /* @__PURE__ */ jsx4(
                      "div",
                      {
                        className: css({
                          display: "flex",
                          bg: "background2",
                          minWidth: "30px",
                          minHeight: "30px",
                          borderRadius: "50%",
                          justifyContent: "center",
                          alignItems: "center"
                        }),
                        children: /* @__PURE__ */ jsx4("strong", { children: config.orgId.charAt(0).toLocaleUpperCase() })
                      }
                    ),
                    /* @__PURE__ */ jsx4(
                      "span",
                      {
                        className: css({
                          display: { base: "none", "@/sm": "inline" }
                        }),
                        children: config.orgId
                      }
                    )
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx4(
                RAListBox,
                {
                  "aria-label": "Navigation",
                  selectionMode: "single",
                  selectedKeys: /* @__PURE__ */ new Set([`${basePath}/${activeTab}`]),
                  children: children3
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs3(
          "div",
          {
            className: css({
              width: "100%"
            }),
            children: [
              !open ? /* @__PURE__ */ jsxs3(Section, { children: [
                isLoading ? /* @__PURE__ */ jsx4(
                  "div",
                  {
                    className: css({
                      display: { base: "none", "@/sm": "inline" },
                      bg: "background2",
                      animation: "pulse",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%"
                    })
                  }
                ) : null,
                data?.user ? /* @__PURE__ */ jsx4(
                  "div",
                  {
                    className: css({
                      display: { base: "inherit", "@/sm": "none" }
                    }),
                    children: /* @__PURE__ */ jsx4(UserMenu, { user: data.user })
                  }
                ) : null
              ] }) : null,
              /* @__PURE__ */ jsxs3(Section, { children: [
                isLoading ? /* @__PURE__ */ jsx4(
                  "div",
                  {
                    className: css({
                      display: { base: "none", "@/sm": "inline" },
                      bg: "background2",
                      animation: "pulse",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%"
                    })
                  }
                ) : null,
                data?.user ? /* @__PURE__ */ jsx4(
                  "div",
                  {
                    className: css({ display: { base: "none", "@/sm": "inherit" } }),
                    children: /* @__PURE__ */ jsx4(UserMenu, { user: data.user })
                  }
                ) : null,
                /* @__PURE__ */ jsx4(
                  Button,
                  {
                    onPress: () => setOpen(open ? null : true),
                    size: "icon",
                    variant: "ghost",
                    children: /* @__PURE__ */ jsx4(icon_default, { name: open ? "PanelLeftClose" : "PanelLeftOpen" })
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};
var Section = ({ children: children3 }) => /* @__PURE__ */ jsx4(
  "div",
  {
    className: css({
      h: 12,
      px: { base: "unset", "@/sm": "6" },
      py: "2",
      width: "100%",
      display: "flex",
      justifyContent: { base: "center", "@/sm": "space-between" },
      alignItems: "center",
      boxSizing: "border-box",
      bg: "background",
      borderTop: "2px solid",
      borderBottom: "2px solid",
      borderColor: "background2"
    }),
    children: children3
  }
);
var Item = ({
  href: href2,
  text,
  icon
}) => {
  return /* @__PURE__ */ jsx4(
    RAListBoxItem,
    {
      id: href2,
      href: href2,
      className: css({
        display: "flex",
        justifyContent: { base: "center", "@/sm": "unset" },
        alignItems: "center",
        textStyle: "body",
        _focusVisible: {
          outline: "none"
        },
        borderBottom: "2px solid",
        borderColor: "background2",
        cursor: "default",
        bg: {
          base: "transparent",
          _focusVisible: "backgroundDim",
          _hover: "backgroundDim",
          _selected: "background"
        },
        width: "100%",
        textAlign: "left",
        h: 14,
        px: { base: "unset", "@/sm": "6" },
        boxSizing: "border-box",
        transition: "all 0.1s",
        color: "inherit",
        position: "relative"
      }),
      textValue: text,
      children: ({ isFocusVisible, isHovered }) => /* @__PURE__ */ jsxs3(Fragment, { children: [
        /* @__PURE__ */ jsxs3(
          "div",
          {
            className: css({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "2"
            }),
            children: [
              /* @__PURE__ */ jsx4(icon_default, { name: icon }),
              /* @__PURE__ */ jsx4(
                "span",
                {
                  className: css({
                    display: { base: "none", "@/sm": "inherit" }
                  }),
                  children: text
                }
              )
            ]
          }
        ),
        isFocusVisible || isHovered ? /* @__PURE__ */ jsx4(Tooltip, { children: text }) : null
      ] })
    }
  );
};
var Tooltip = ({ children: children3 }) => /* @__PURE__ */ jsx4(
  "div",
  {
    className: css({
      display: { base: "inherit", "@/sm": "none" },
      zIndex: 1e3,
      left: "120%",
      position: "absolute"
    }),
    children: /* @__PURE__ */ jsx4(
      "div",
      {
        className: css({
          bg: "background2",
          py: "1",
          px: "2",
          _before: {
            content: `""`,
            display: "block",
            width: "0",
            height: "0",
            position: "absolute",
            left: "-8px",
            top: "25%",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            borderRight: "8px solid",
            borderRightColor: "background2"
          }
        }),
        children: /* @__PURE__ */ jsx4("span", { className: css({}), children: children3 })
      }
    )
  }
);
var Content = ({ text }) => {
  const { content } = usePaths();
  return /* @__PURE__ */ jsx4(Item, { icon: "GalleryVertical", href: content, text: text || "Content" });
};
var Flags = ({ text }) => {
  const { flags } = usePaths();
  return /* @__PURE__ */ jsx4(Item, { icon: "ToggleRight", href: flags, text: text || "Flags" });
};
var Experiments = ({ text }) => {
  const { experiments } = usePaths();
  return /* @__PURE__ */ jsx4(Item, { icon: "FlaskConical", href: experiments, text: text || "Experiments" });
};
var Forms = ({ text }) => {
  const { forms } = usePaths();
  return /* @__PURE__ */ jsx4(Item, { icon: "Send", href: forms, text: text || "Forms" });
};
var Assets = ({ text }) => {
  const { assets } = usePaths();
  return /* @__PURE__ */ jsx4(Item, { icon: "FolderOpen", href: assets, text: text || "Assets" });
};
var SideNav = {
  Container,
  Content,
  Flags,
  Experiments,
  Forms,
  Assets
};

// components/typography.tsx
import "react";
import { jsx as jsx5 } from "react/jsx-runtime";
var PageTitle = ({ children: children3 }) => /* @__PURE__ */ jsx5(
  "h1",
  {
    className: css({
      textStyle: "heading1"
    }),
    children: children3
  }
);

// components/layout.tsx
import { useState as useState2 } from "react";
import { RouterProvider } from "react-aria-components";

// components/dialog.tsx
import { createContext as createContext2, useContext as useContext2 } from "react";
import {
  Dialog as RADialog,
  DialogTrigger as RADialogTrigger,
  Heading as RAHeading,
  Modal as RAModal,
  ModalOverlay as RAModalOverlay
} from "react-aria-components";

// components/form.tsx
import { CheckSquare, Loader2, Square } from "lucide-react";
import { z } from "zod";
import {
  FieldError as RAFieldError,
  Checkbox as RACheckbox,
  CheckboxGroup as RACheckboxGroup,
  Label as RALabel,
  ComboBox as RAComboBox,
  Popover as RAPopover2,
  ListBox as RAListBox2,
  ListBoxItem as RAListBoxItem2,
  Input as RAInput,
  Select as RASelect,
  Text as RAText,
  SelectValue as RASelectValue
} from "react-aria-components";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forwardRef as forwardRef22,
  useEffect as useEffect2
} from "react";
import { FieldError, Text } from "react-aria-components";
import { jsx as jsx6, jsxs as jsxs4 } from "react/jsx-runtime";
var ListBoxPopover = ({
  items
}) => /* @__PURE__ */ jsx6(RAPopover2, { children: /* @__PURE__ */ jsx6(
  RAListBox2,
  {
    className: css({
      bg: "background2",
      boxSizing: "border-box",
      w: "var(--trigger-width)",
      flex: 1,
      textStyle: "body",
      maxH: "500px",
      overflowY: "scroll",
      _focusVisible: {
        outline: "none",
        ringColor: "prometheus",
        ring: "2px solid"
      },
      scrollbar: "hidden"
    }),
    children: items.map((item) => /* @__PURE__ */ jsx6(
      RAListBoxItem2,
      {
        id: item.value,
        className: css({
          p: 2,
          _focusVisible: { bg: "backgroundDim", outline: "none" },
          _hover: { bg: "backgroundDim" }
        }),
        children: item.label
      },
      item.value
    ))
  }
) });
var Select = (props) => {
  return /* @__PURE__ */ jsxs4(
    RASelect,
    {
      className: css({
        display: "flex",
        flexDirection: "column",
        gap: 2
      }),
      ...props,
      children: [
        /* @__PURE__ */ jsxs4(
          Button,
          {
            variant: props.buttonVariant,
            size: props.buttonSize,
            className: css({
              minW: 40,
              justifyContent: "space-between",
              scrollbar: "hidden"
            }),
            children: [
              /* @__PURE__ */ jsx6(RASelectValue, {}),
              /* @__PURE__ */ jsx6(icon_default, { name: "ChevronDown" })
            ]
          }
        ),
        /* @__PURE__ */ jsx6(ListBoxPopover, { items: props.items })
      ]
    }
  );
};
function SelectField({
  label,
  description,
  errorMessage,
  items,
  name,
  ...props
}) {
  const { control } = useFormContext();
  return /* @__PURE__ */ jsx6(
    Controller,
    {
      control,
      name,
      render: ({
        field: { name: name2, value, onChange, onBlur, ref },
        fieldState: { invalid, error }
      }) => /* @__PURE__ */ jsxs4(
        RASelect,
        {
          ...props,
          name: name2,
          selectedKey: value,
          onSelectionChange: onChange,
          onBlur,
          isRequired: true,
          validationBehavior: "aria",
          isInvalid: invalid,
          ref,
          className: css({
            display: "flex",
            flexDirection: "column",
            gap: 2
          }),
          children: [
            /* @__PURE__ */ jsx6(RALabel, { children: label }),
            /* @__PURE__ */ jsxs4(
              Button,
              {
                variant: "outline",
                className: css({
                  h: 10,
                  w: "full",
                  justifyContent: "space-between"
                }),
                children: [
                  /* @__PURE__ */ jsx6(RASelectValue, {}),
                  /* @__PURE__ */ jsx6(icon_default, { name: "ChevronDown" })
                ]
              }
            ),
            description && /* @__PURE__ */ jsx6(Text, { slot: "description", children: description }),
            /* @__PURE__ */ jsx6(
              RAFieldError,
              {
                className: css({
                  color: "red"
                }),
                children: error?.message
              }
            ),
            /* @__PURE__ */ jsx6(ListBoxPopover, { items })
          ]
        }
      )
    }
  );
}
var Form = ({
  onSubmit,
  validationSchema,
  defaultValues,
  children: children3
}) => {
  const methods = useForm({
    defaultValues,
    resolver: validationSchema ? zodResolver(validationSchema) : void 0
  });
  return /* @__PURE__ */ jsx6(FormProvider, { ...methods, children: /* @__PURE__ */ jsx6(
    "form",
    {
      className: css({
        display: "flex",
        flexDirection: "column",
        gap: 6
      }),
      onSubmit: methods.handleSubmit(async (data, event) => {
        await onSubmit(data, event);
      }),
      children: children3
    }
  ) });
};
var inputStyle = cva({
  base: {
    bg: "background2",
    display: "flex",
    gap: "2",
    alignItems: "center",
    cursor: "default",
    _hover: {
      bg: "background2Dim"
    },
    width: "full",
    boxSizing: "border-box",
    _focusWithin: {
      outline: "none",
      ring: "2px solid",
      ringColor: "prometheus",
      ringOffset: "-2px",
      _hover: {
        bg: "background2Dim"
      }
    },
    _disabled: {
      opacity: 0.5
    },
    transition: "all"
  },
  variants: {
    size: {
      default: {
        h: "10"
      },
      sm: {
        h: "8"
      }
    }
  },
  defaultVariants: {
    size: "default"
  }
});
var Input = forwardRef22(
  ({ size, className, icon, ...props }, ref) => /* @__PURE__ */ jsxs4("div", { className: inputStyle({ size }), children: [
    icon ? /* @__PURE__ */ jsx6(icon_default, { name: icon, className: css({ h: "4" }) }) : null,
    /* @__PURE__ */ jsx6(
      RAInput,
      {
        className: css({
          bg: "background2",
          _hover: {
            bg: "transparent"
          },
          color: "text",
          cursor: "default",
          px: 2,
          w: "full",
          h: "full",
          border: "none",
          boxSizing: "border-box",
          _focusVisible: {
            outline: "none"
          }
        }),
        ...props,
        ref
      }
    )
  ] })
);
var TextField = ({
  name,
  label,
  description,
  watch
}) => {
  const {
    register,
    formState: { errors },
    ...methods
  } = useFormContext();
  useEffect2(() => {
    if (watch) {
      const subscription = methods.watch((value, { name: watchName }) => {
        if (watchName === name) {
          watch({
            value: value[name],
            setValue: methods.setValue
          });
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [methods.watch]);
  return /* @__PURE__ */ jsxs4(
    "div",
    {
      className: css({
        display: "flex",
        flexDirection: "column",
        gap: 2
      }),
      children: [
        /* @__PURE__ */ jsx6("label", { className: css({ opacity: 0.9 }), htmlFor: name, children: label }),
        /* @__PURE__ */ jsx6(Input, { id: name, ...register(name) }),
        description ? /* @__PURE__ */ jsx6("span", { className: css({ textStyle: "caption", opacity: 0.8 }), children: description }) : null,
        typeof errors[name]?.message === "string" && /* @__PURE__ */ jsx6("p", { className: css({ color: "red" }), children: `${errors[name]?.message}` })
      ]
    }
  );
};
var zodCheckboxGroupSchema = z.union([z.literal("production"), z.literal("development")]).array().optional();
var zodURLFriendlyIDSchema = z.string().regex(/^[a-z0-9_\-\/]+$/, "Must be lowercase and URL friendly").min(3, "Must be at least 3 characters long");
var SubmitButton = ({
  children: children3,
  ...props
}) => {
  const {
    formState: { isSubmitting }
  } = useFormContext();
  return /* @__PURE__ */ jsx6(
    Button,
    {
      className: css({
        textStyle: "body",
        w: "full",
        _disabled: {
          opacity: 0.5
        }
      }),
      type: "submit",
      isDisabled: isSubmitting,
      ...props,
      children: isSubmitting ? /* @__PURE__ */ jsx6(Loader2, { className: css({ animation: "spin" }) }) : children3
    }
  );
};

// components/dialog.tsx
import { z as z2 } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormContext as useFormContext2 } from "react-hook-form";
import { Fragment as Fragment2, jsx as jsx7, jsxs as jsxs5 } from "react/jsx-runtime";
var Dialog = ({
  heading,
  subheading,
  children: children3,
  ...props
}) => {
  return /* @__PURE__ */ jsx7(
    RAModalOverlay,
    {
      isDismissable: true,
      className: css({
        h: "100%",
        position: "absolute",
        top: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        w: "full",
        bg: "backgroundDim",
        color: "text"
      }),
      ...props,
      children: /* @__PURE__ */ jsx7(
        RAModal,
        {
          className: css({
            bg: "background",
            p: "6",
            border: "2px solid",
            borderColor: "background2",
            outline: "none",
            w: "1/2",
            textStyle: "body"
          }),
          children: /* @__PURE__ */ jsx7(
            RADialog,
            {
              className: css({
                outline: "none"
              }),
              children: () => /* @__PURE__ */ jsxs5(Fragment2, { children: [
                /* @__PURE__ */ jsx7(
                  RAHeading,
                  {
                    slot: "title",
                    className: css({
                      textStyle: "heading1",
                      margin: 0
                    }),
                    children: heading
                  }
                ),
                /* @__PURE__ */ jsx7("p", { className: css({ opacity: 0.8, mt: 2, mb: 4 }), children: subheading }),
                children3
              ] })
            }
          )
        }
      )
    }
  );
};
var GlobalDialogContext = createContext2({ dialog: { type: null, values: null }, setDialog: () => null });
var GlobalDialogProvider = GlobalDialogContext.Provider;
var useGlobalDialog = () => useContext2(GlobalDialogContext);
var CreateContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.createContent(vars),
    onSuccess: (newData) => {
      queryClient2.setQueryData(
        ["getContentByPrefix"],
        (oldData) => ({
          content: oldData?.content ? [...oldData?.content, newData?.content] : [newData?.content]
        })
      );
      queryClient2.invalidateQueries({ queryKey: ["getContentByPrefix"] });
      setDialog({ type: null, values: null });
    }
  });
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: "Create content",
      subheading: "Let's give your content a name",
      isOpen: dialog.type === "create-content",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          validationSchema: z2.object({
            displayName: z2.string().min(2, "Must be more than 2 characters long"),
            contentId: zodURLFriendlyIDSchema
          }),
          onSubmit: (data) => {
            return mutate({
              displayName: data.displayName,
              contentId: data.contentId,
              previewLayout: ""
            });
          },
          children: [
            /* @__PURE__ */ jsx7(
              TextField,
              {
                name: "displayName",
                label: "Name",
                watch: ({ value, setValue }) => {
                  return setValue(
                    "contentId",
                    value.replaceAll(/(\s|[^a-zA-Z0-9_\-\/])/g, "-").toLowerCase()
                  );
                }
              }
            ),
            /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "ID" }),
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Create content" })
          ]
        }
      )
    }
  );
};
var DeleteContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.removeContent(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getContentByPrefix"]
      });
      queryClient2.setQueryData(
        ["getContentByPrefix"],
        (oldData) => ({
          content: oldData?.content.filter(
            (content) => content.contentId !== vars.contentId
          )
        })
      );
      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({ queryKey: ["getContentByPrefix"] });
    }
  });
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: `Delete ${`"${dialog.values?.contentId}"` || "content"}`,
      subheading: "This action is permanent. Ensure you have a back up of important content before proceeding.",
      isOpen: dialog.type === "delete-content",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          defaultValues: {
            contentId: dialog?.values?.contentId
          },
          validationSchema: z2.object({
            contentId: zodURLFriendlyIDSchema
          }),
          onSubmit: (data) => {
            return mutate({
              contentId: data.contentId
            });
          },
          children: [
            !dialog.values?.contentId ? /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "ID" }) : null,
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Delete content" })
          ]
        }
      )
    }
  );
};
var PublishContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.publishContent(vars),
    onSuccess: (newData) => {
      queryClient2.invalidateQueries({ queryKey: ["getContentByPrefix"] });
      setDialog({ type: null, values: null });
    }
  });
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: `Publish ${`"${dialog.values?.contentId}"` || "content"}`,
      subheading: "Any changes you've made will go live.",
      isOpen: dialog.type === "publish-content",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          defaultValues: {
            contentId: dialog?.values?.contentId
          },
          validationSchema: z2.object({
            contentId: zodURLFriendlyIDSchema
          }),
          onSubmit: (data) => {
            return mutate({
              contentId: data.contentId
            });
          },
          children: [
            !dialog.values?.contentId ? /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "ID" }) : null,
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Publish content" })
          ]
        }
      )
    }
  );
};
var BatchDeleteContentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.batchRemoveContent(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getContentByPrefix"]
      });
      queryClient2.setQueryData(
        ["getContentByPrefix"],
        (oldData) => ({
          content: oldData?.content.filter(
            (content) => !vars.contentIds.includes(content.contentId)
          )
        })
      );
      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({ queryKey: ["getContentByPrefix"] });
    }
  });
  return /* @__PURE__ */ jsxs5(
    Dialog,
    {
      heading: "Delete content",
      subheading: "This action is permanent. Ensure you have a back up of important content before proceeding.",
      isOpen: dialog.type === "batch-delete-content",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: [
        /* @__PURE__ */ jsx7("p", { children: "You are about to delete the following items:" }),
        /* @__PURE__ */ jsx7(
          "div",
          {
            className: css({
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
              p: 2,
              border: "2px solid",
              borderColor: "background2"
            }),
            children: dialog.values?.contentIds?.map((contentId) => /* @__PURE__ */ jsx7(
              "span",
              {
                className: css({ bg: "background2", p: 1, whiteSpace: "nowrap" }),
                children: contentId
              },
              contentId
            ))
          }
        ),
        /* @__PURE__ */ jsx7(
          Form,
          {
            defaultValues: {
              contentIds: dialog?.values?.contentIds
            },
            validationSchema: z2.object({
              contentIds: z2.array(zodURLFriendlyIDSchema)
            }),
            onSubmit: (data) => {
              return mutate({
                contentIds: data.contentIds
              });
            },
            children: /* @__PURE__ */ jsx7(SubmitButton, { children: "Delete content" })
          }
        )
      ]
    }
  );
};
var ComponentControls = ({ defaultType }) => {
  const { watch } = useFormContext2();
  const components = useComponents();
  const type = defaultType || watch("type", false);
  if (!type) return null;
  const selectedComponentControls = components[type]?.controls || {};
  const controlKeys = Object.keys(selectedComponentControls);
  return controlKeys.length > 0 ? controlKeys.map((key) => /* @__PURE__ */ jsx7(TextField, { name: `controls.${key}`, label: key }, key)) : /* @__PURE__ */ jsx7("p", { children: "This component type has no controls" });
};
var CreateComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const components = useComponents();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.createComponent(vars),
    onSuccess: (newData, vars) => {
      queryClient2.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData) => {
          if (newData?.component) {
            let newComponents = [];
            if (vars.position === "end") {
              newComponents = [...oldData?.components, newData.component];
            } else {
              const copy = [...oldData?.components];
              console.log(copy, vars.position);
              copy.splice(vars.position, 0, newData.component);
              newComponents = copy;
            }
            console.log("1");
            return {
              components: newComponents
            };
          } else {
            console.log("2");
            return oldData;
          }
        }
      );
      queryClient2.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
      setDialog({ type: null, values: null });
    }
  });
  const items = Object.keys(components).map((componentId) => ({
    value: componentId,
    label: components[componentId]?.displayName || componentId
  }));
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: "Create component",
      subheading: "Let's give your component a name",
      isOpen: dialog.type === "create-component",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          defaultValues: {
            contentId: dialog?.values?.contentId
          },
          validationSchema: z2.object({
            displayName: z2.string().min(2, "Must be more than 2 characters long"),
            contentId: zodURLFriendlyIDSchema,
            type: z2.string(),
            controls: z2.record(z2.string(), z2.any()).optional()
          }),
          onSubmit: (data) => {
            return mutate({
              contentId: data.contentId,
              displayName: data.displayName,
              type: data.type,
              controls: data.controls || {},
              position: dialog.values?.position === void 0 ? "end" : dialog.values?.position
            });
          },
          children: [
            /* @__PURE__ */ jsx7(TextField, { name: "displayName", label: "Name" }),
            !dialog.values?.contentId ? /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "Content ID" }) : null,
            /* @__PURE__ */ jsx7(SelectField, { name: "type", label: "Type", items }),
            /* @__PURE__ */ jsx7(ComponentControls, {}),
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Create component" })
          ]
        }
      )
    }
  );
};
var EditComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const components = useComponents();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.updateComponent(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
      queryClient2.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData) => ({
          components: oldData?.components ? oldData?.components.map((component) => {
            if (component.componentId === vars.componentId) {
              return { ...component, ...vars };
            }
            return component;
          }) : null
        })
      );
      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
    }
  });
  const item = {
    value: dialog.values?.type,
    label: components[dialog.values?.type]?.displayName || dialog.values?.type
  };
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: "Edit component",
      subheading: "Configure your component",
      isOpen: dialog.type === "edit-component",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          defaultValues: {
            contentId: dialog?.values?.contentId,
            componentId: dialog?.values?.componentId,
            displayName: dialog?.values?.displayName,
            controls: dialog?.values?.controls
          },
          validationSchema: z2.object({
            displayName: z2.string().min(2, "Must be more than 2 characters long"),
            contentId: zodURLFriendlyIDSchema,
            componentId: z2.string(),
            controls: z2.record(z2.string(), z2.any())
          }),
          onSubmit: (data) => {
            return mutate({
              contentId: data.contentId,
              componentId: data.componentId,
              displayName: data.displayName,
              controls: data.controls
            });
          },
          children: [
            /* @__PURE__ */ jsx7(TextField, { name: "displayName", label: "Name" }),
            !dialog.values?.contentId ? /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "Content ID" }) : null,
            !dialog.values?.componentId ? /* @__PURE__ */ jsx7(TextField, { name: "componentId", label: "Content ID" }) : null,
            /* @__PURE__ */ jsx7(
              SelectField,
              {
                name: "type",
                label: "Type",
                items: [item],
                defaultSelectedKey: dialog.values?.type,
                isDisabled: true
              }
            ),
            /* @__PURE__ */ jsx7(ComponentControls, { defaultType: dialog.values?.type }),
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Edit component" })
          ]
        }
      )
    }
  );
};
var DeleteComponentDialog = () => {
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: async (vars) => await studioClient.removeComponent(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
      queryClient2.setQueryData(
        ["getComponentsByContentId", dialog.values?.contentId],
        (oldData) => ({
          components: oldData?.components ? oldData?.components.filter((component) => {
            return component.componentId !== vars.componentId;
          }) : null
        })
      );
      setDialog({ type: null, values: null });
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
    }
  });
  return /* @__PURE__ */ jsx7(
    Dialog,
    {
      heading: "Delete component",
      subheading: "This action is permanent.",
      isOpen: dialog.type === "delete-component",
      onOpenChange: () => setDialog({ type: null, values: null }),
      children: /* @__PURE__ */ jsxs5(
        Form,
        {
          defaultValues: {
            contentId: dialog?.values?.contentId,
            componentId: dialog?.values?.componentId
          },
          validationSchema: z2.object({
            contentId: zodURLFriendlyIDSchema,
            componentId: z2.string()
          }),
          onSubmit: (data) => {
            return mutate({
              contentId: data.contentId,
              componentId: data.componentId
            });
          },
          children: [
            !dialog.values?.contentId ? /* @__PURE__ */ jsx7(TextField, { name: "contentId", label: "Content ID" }) : null,
            !dialog.values?.componentId ? /* @__PURE__ */ jsx7(TextField, { name: "componentId", label: "Content ID" }) : null,
            /* @__PURE__ */ jsx7(SubmitButton, { children: "Delete component" })
          ]
        }
      )
    }
  );
};
var Dialogs = () => {
  const { dialog } = useGlobalDialog();
  return /* @__PURE__ */ jsxs5(Fragment2, { children: [
    dialog.type === "create-content" ? /* @__PURE__ */ jsx7(CreateContentDialog, {}) : null,
    dialog.type === "publish-content" ? /* @__PURE__ */ jsx7(PublishContentDialog, {}) : null,
    dialog.type === "delete-content" ? /* @__PURE__ */ jsx7(DeleteContentDialog, {}) : null,
    dialog.type === "batch-delete-content" ? /* @__PURE__ */ jsx7(BatchDeleteContentDialog, {}) : null,
    dialog.type === "create-component" ? /* @__PURE__ */ jsx7(CreateComponentDialog, {}) : null,
    dialog.type === "edit-component" ? /* @__PURE__ */ jsx7(EditComponentDialog, {}) : null,
    dialog.type === "delete-component" ? /* @__PURE__ */ jsx7(DeleteComponentDialog, {}) : null
  ] });
};

// components/layout.tsx
import { jsx as jsx8, jsxs as jsxs6 } from "react/jsx-runtime";
var StudioProvider = ({
  config,
  children: children3
}) => {
  return /* @__PURE__ */ jsx8(VestiaProvider, { config, children: /* @__PURE__ */ jsx8(
    RouterProvider,
    {
      navigate: config.routing.navigate,
      useHref: config.routing.useHref,
      children: /* @__PURE__ */ jsx8(StudioLayout, { children: children3 })
    }
  ) });
};
var StudioLayout = ({ children: children3 }) => {
  const [dialog, setDialog] = useState2({
    type: null,
    values: null
  });
  return /* @__PURE__ */ jsx8(GlobalDialogProvider, { value: { dialog, setDialog }, children: /* @__PURE__ */ jsxs6(
    "div",
    {
      className: css({
        width: "100%",
        display: "flex",
        bg: "background",
        color: "text",
        textStyle: "body"
      }),
      children: [
        children3,
        /* @__PURE__ */ jsx8(Dialogs, {})
      ]
    }
  ) });
};
var PageLayout = ({
  header,
  children: children3
}) => /* @__PURE__ */ jsxs6(
  "main",
  {
    className: css({
      width: "100%",
      display: "flex",
      flexDirection: "column"
    }),
    children: [
      /* @__PURE__ */ jsx8(
        "div",
        {
          className: css({
            minH: 12,
            width: "100%",
            boxSizing: "border-box",
            bg: "background",
            borderTop: "2px solid",
            borderBottom: "2px solid",
            borderColor: "background2",
            display: "flex",
            alignItems: "center",
            gap: 2,
            px: 4
          }),
          children: header
        }
      ),
      children3
    ]
  }
);

// components/grid-list.tsx
import { CheckSquare as CheckSquare2, Square as Square2 } from "lucide-react";
import {
  Checkbox as RACheckbox2,
  GridList as RAGridList,
  GridListItem
} from "react-aria-components";
import { jsx as jsx9 } from "react/jsx-runtime";
function Container2({
  children: children3,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx9(
    RAGridList,
    {
      className: css(
        {
          backgroundColor: "background2",
          "& .react-aria-DropIndicator": {
            border: "1px solid",
            borderColor: "prometheus"
          }
        },
        className
      ),
      ...props,
      children: children3
    }
  );
}
function Item2({ children: children3, ...props }) {
  let textValue = typeof children3 === "string" ? children3 : void 0;
  return /* @__PURE__ */ jsx9(
    GridListItem,
    {
      className: css({
        _focusVisible: {
          outline: "none",
          ring: "2px solid",
          ringColor: "prometheus",
          ringOffset: "-2px"
        },
        bg: {
          base: "background",
          _hover: "background2",
          _focusVisible: "background2",
          _selected: "background2"
        },
        p: 2,
        display: "flex",
        alignItems: "center",
        textStyle: "body",
        gap: 2
      }),
      textValue,
      ...props,
      children: (props2) => children3 && typeof children3 === "function" ? children3(props2) : children3
    }
  );
}
function Checkbox({ children: children3, ...props }) {
  return /* @__PURE__ */ jsx9(RACheckbox2, { slot: props.slot, className: css({ display: "flex" }), children: ({ isSelected }) => isSelected ? /* @__PURE__ */ jsx9(CheckSquare2, {}) : /* @__PURE__ */ jsx9(Square2, {}) });
}
var GridList = {
  Container: Container2,
  Item: Item2,
  Checkbox
};

// pages/login.tsx
import { useState as useState3, useEffect as useEffect3 } from "react";
import { jsx as jsx10, jsxs as jsxs7 } from "react/jsx-runtime";
var Login = () => {
  const [isClient, setIsClient] = useState3(false);
  const paths = usePaths();
  let params = new URLSearchParams();
  if (isClient) {
    params = new URLSearchParams({
      client_id: "client",
      response_type: "code",
      redirect_uri: `${window.location.origin}${paths.auth}/callback`
    });
  }
  useEffect3(() => {
    setIsClient(true);
  }, []);
  return /* @__PURE__ */ jsx10(
    "main",
    {
      className: css({
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textStyle: "body"
      }),
      children: /* @__PURE__ */ jsxs7(
        "div",
        {
          className: css({
            border: "2px solid",
            borderColor: "background2",
            p: "4",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            width: "40%"
          }),
          children: [
            /* @__PURE__ */ jsx10("h1", { className: css({ textStyle: "heading1" }), children: "Login" }),
            /* @__PURE__ */ jsxs7(
              "a",
              {
                className: css({
                  textDecoration: "none",
                  ...buttonStyle.raw({ variant: "default" })
                }),
                href: `${AUTH_URL}/google/authorize/?` + params,
                children: [
                  /* @__PURE__ */ jsx10(
                    CustomIcons.google,
                    {
                      className: css({
                        h: "4",
                        mr: "2"
                      })
                    }
                  ),
                  "Continue with Google"
                ]
              }
            )
          ]
        }
      )
    }
  );
};

// pages/content/index.tsx
import "react";

// components/breadcrumbs.tsx
import { Link } from "react-aria-components";
import "react";
import { jsx as jsx11, jsxs as jsxs8 } from "react/jsx-runtime";
var BreadcrumbItem = ({ children: children3 }) => /* @__PURE__ */ jsx11(
  "span",
  {
    className: css({
      display: "flex",
      alignItems: "center",
      gap: 2
    }),
    children: children3
  }
);
var BreadcrumbLink = ({
  href: href2,
  children: children3
}) => /* @__PURE__ */ jsx11(
  Link,
  {
    className: css({
      display: "flex",
      alignItems: "center",
      color: "text",
      gap: 2,
      _focusVisible: {
        outline: "none",
        ring: "2px solid",
        ringColor: "prometheus"
      },
      textStyle: "body",
      opacity: 0.8,
      cursor: "default",
      _hover: {
        opacity: 1,
        borderBottom: "2px solid"
      }
    }),
    href: href2,
    children: children3
  }
);
var Breadcrumbs = ({
  breadcrumbs
}) => {
  const { content } = usePaths();
  return /* @__PURE__ */ jsxs8(
    "div",
    {
      className: css({
        display: "flex",
        alignItems: "center",
        gap: 2
      }),
      children: [
        breadcrumbs.length === 0 ? /* @__PURE__ */ jsxs8(BreadcrumbItem, { children: [
          /* @__PURE__ */ jsx11(icon_default, { name: "FolderRoot" }),
          " Content"
        ] }) : /* @__PURE__ */ jsxs8(BreadcrumbLink, { href: content, children: [
          /* @__PURE__ */ jsx11(icon_default, { name: "FolderRoot" }),
          " Content"
        ] }),
        breadcrumbs.map(
          (breadcrumb, index) => index === breadcrumbs.length - 1 || !breadcrumb.href ? /* @__PURE__ */ jsxs8(BreadcrumbItem, { children: [
            /* @__PURE__ */ jsx11("span", { children: "/" }),
            /* @__PURE__ */ jsx11(icon_default, { name: breadcrumb.isLeafNode ? "File" : "Folder" }),
            breadcrumb.text
          ] }, breadcrumb.text) : /* @__PURE__ */ jsxs8(BreadcrumbItem, { children: [
            "/",
            /* @__PURE__ */ jsxs8(BreadcrumbLink, { href: breadcrumb.href, children: [
              /* @__PURE__ */ jsx11(icon_default, { name: "Folder" }),
              breadcrumb.text
            ] })
          ] }, breadcrumb.text)
        )
      ]
    }
  );
};

// pages/content/directory.tsx
import { useQuery as useQuery2 } from "@tanstack/react-query";
import { Link as Link2 } from "react-aria-components";
import { useState as useState4 } from "react";
import { Plus } from "lucide-react";
import "react-aria-components";

// components/toolbar.tsx
import { jsx as jsx12 } from "react/jsx-runtime";
var Toolbar = ({ children: children3 }) => /* @__PURE__ */ jsx12(
  "div",
  {
    className: css({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 2,
      px: 4,
      minH: 14,
      boxSizing: "border-box",
      borderBottom: "2px solid",
      borderColor: "background2"
    }),
    children: children3
  }
);

// pages/content/directory.tsx
import { Fragment as Fragment3, jsx as jsx13, jsxs as jsxs9 } from "react/jsx-runtime";
var findGroups = (content) => {
  const groups = {};
  for (const item of content) {
    const parts = item.contentId.split("/");
    if (parts.length === 1) {
      groups["root"] = [];
    } else {
      const group = parts.slice(0, -1).join("/");
      groups[group] = [];
    }
  }
  return groups;
};
var isContentArray = (content) => {
  return content?.length > 0;
};
var groupContent = (content) => {
  const groups = findGroups(content);
  for (const item of content) {
    const { contentId } = item;
    const parts = contentId.split("/");
    if (groups[contentId]) {
      groups[contentId] = isContentArray(groups[contentId]) ? [...groups[contentId], item] : [item];
    } else if (parts.length === 1) {
      groups["root"] = isContentArray(groups["root"]) ? [...groups["root"], item] : [item];
    } else {
      const group = parts.slice(0, -1).join("/");
      groups[group] = isContentArray(groups[group]) ? [...groups[group], item] : [item];
    }
  }
  return groups;
};
var NoContent = () => {
  const { setDialog } = useGlobalDialog();
  return /* @__PURE__ */ jsxs9(
    "div",
    {
      className: css({
        w: "full",
        h: "60%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
      }),
      children: [
        /* @__PURE__ */ jsx13(
          icon_default,
          {
            name: "GalleryVertical",
            size: 100,
            className: css({ opacity: 0.2, mb: 5 })
          }
        ),
        /* @__PURE__ */ jsx13("p", { className: css({ textStyle: "2xl" }), children: "It looks like you don't have any content" }),
        /* @__PURE__ */ jsxs9(
          Button,
          {
            onPress: () => {
              setDialog({ type: "create-content", values: null });
            },
            variant: "ghost",
            children: [
              /* @__PURE__ */ jsx13(icon_default, { name: "Plus", className: css({ mr: 2 }) }),
              "Create content"
            ]
          }
        )
      ]
    }
  );
};
var DirectoryPage = () => {
  const { setDialog } = useGlobalDialog();
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const studioClient = useStudioClient();
  const { data, isLoading, isError } = useQuery2({
    queryKey: ["getContentByPrefix"],
    queryFn: async () => await studioClient.getContentByPrefix({ prefix: "" })
  });
  const [isSelecting, setIsSelecting] = useState4(false);
  let [selectedKeys, setSelectedKeys] = useState4(/* @__PURE__ */ new Set([]));
  if (isLoading)
    return /* @__PURE__ */ jsx13(
      "div",
      {
        className: css({
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          h: "85vh"
        }),
        children: /* @__PURE__ */ jsx13(
          icon_default,
          {
            name: "Loader",
            size: 50,
            className: css({
              animation: "spin",
              animationDuration: "2s",
              opacity: 0.5
            })
          }
        )
      }
    );
  if (isError || !data)
    return /* @__PURE__ */ jsxs9(
      "div",
      {
        className: css({
          w: "full",
          h: "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }),
        children: [
          /* @__PURE__ */ jsx13(
            icon_default,
            {
              name: "Frown",
              size: 100,
              className: css({ opacity: 0.2, mb: 5 })
            }
          ),
          /* @__PURE__ */ jsx13("p", { className: css({ textStyle: "2xl" }), children: "Sorry, something went wrong. Please try again later." })
        ]
      }
    );
  const groupedContent = groupContent(data.content);
  const currentRoot = prefix || "root";
  const currentRootContent = groupedContent[currentRoot];
  const currentRootGroups = Object.keys(groupedContent).filter((group) => {
    const isNotCurrentRoot = group !== currentRoot;
    const isSubGroup = group.startsWith(prefix || "");
    const currentDepth = currentRoot === "root" ? 0 : currentRoot.split("/").length;
    const groupDepth = group === "root" ? 0 : group.split("/").length;
    const isDirectDescendant = groupDepth - currentDepth === 1;
    return isNotCurrentRoot && isDirectDescendant && isSubGroup;
  });
  return /* @__PURE__ */ jsxs9(Fragment3, { children: [
    /* @__PURE__ */ jsxs9(Toolbar, { children: [
      /* @__PURE__ */ jsxs9(
        "div",
        {
          className: css({
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center"
          }),
          children: [
            /* @__PURE__ */ jsx13(
              Button,
              {
                onPress: () => {
                  setIsSelecting(!isSelecting);
                  setSelectedKeys(/* @__PURE__ */ new Set([]));
                },
                variant: "ghost",
                size: "sm",
                children: isSelecting ? /* @__PURE__ */ jsx13(icon_default, { name: "X" }) : /* @__PURE__ */ jsx13(icon_default, { name: "BoxSelect" })
              }
            ),
            isSelecting ? /* @__PURE__ */ jsxs9(Fragment3, { children: [
              /* @__PURE__ */ jsx13(
                Button,
                {
                  onPress: () => {
                    let contentIds = [];
                    if (isContentArray(currentRootContent)) {
                      contentIds = currentRootContent.map(
                        (item) => item.contentId
                      );
                    }
                    if (contentIds.length > 0) {
                      setSelectedKeys(/* @__PURE__ */ new Set([...selectedKeys, ...contentIds]));
                    }
                  },
                  variant: "ghost",
                  size: "sm",
                  children: "Select all"
                }
              ),
              /* @__PURE__ */ jsx13(
                Button,
                {
                  onPress: () => {
                    if (selectedKeys.size > 0) {
                      setDialog({
                        type: "batch-delete-content",
                        values: {
                          contentIds: Array.from(selectedKeys)
                        }
                      });
                    }
                  },
                  variant: "ghost",
                  size: "sm",
                  children: /* @__PURE__ */ jsx13(icon_default, { name: "Trash" })
                }
              ),
              /* @__PURE__ */ jsxs9("span", { className: css({ p: 2 }), children: [
                selectedKeys.size,
                " selected"
              ] })
            ] }) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxs9(
        Button,
        {
          onPress: () => {
            setDialog({ type: "create-content", values: null });
          },
          variant: "ghost",
          size: "sm",
          children: [
            /* @__PURE__ */ jsx13(Plus, { className: css({ mr: 2 }) }),
            "Create content"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx13(DirectoryGroups, { currentRootGroups }),
    /* @__PURE__ */ jsx13(
      DirectoryContent,
      {
        currentRootContent,
        isSelecting,
        selectedKeys,
        setSelectedKeys
      }
    )
  ] });
};
var DirectoryGroups = ({
  currentRootGroups
}) => {
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const { content } = usePaths();
  return currentRootGroups.length > 0 ? /* @__PURE__ */ jsx13(
    "div",
    {
      className: css({
        m: 4,
        border: "2px solid",
        borderColor: "background2"
      }),
      children: currentRootGroups.map((group) => /* @__PURE__ */ jsx13(
        Link2,
        {
          className: css({
            _focusVisible: {
              outline: "none",
              ring: "2px solid",
              ringColor: "prometheus",
              ringOffset: "-2px"
            },
            bg: {
              base: "background",
              _hover: "background2",
              _focusVisible: "background2"
            },
            p: 2,
            display: "flex",
            alignItems: "center",
            textStyle: "body",
            gap: 2,
            textDecoration: "none",
            color: "text"
          }),
          href: `${content}?prefix=${group}`,
          children: ({ isHovered }) => /* @__PURE__ */ jsxs9(
            "div",
            {
              className: css({
                display: "flex",
                gap: 2,
                alignItems: "center"
              }),
              children: [
                isHovered ? /* @__PURE__ */ jsx13(icon_default, { name: "FolderOpen" }) : /* @__PURE__ */ jsx13(icon_default, { name: "Folder" }),
                /* @__PURE__ */ jsx13(
                  "span",
                  {
                    className: css({
                      fontWeight: "500"
                    }),
                    children: prefix ? group.slice(prefix.length + 1) : group
                  }
                )
              ]
            }
          )
        },
        group
      ))
    }
  ) : null;
};
var DirectoryContent = ({
  currentRootContent,
  isSelecting,
  selectedKeys,
  setSelectedKeys
}) => {
  const { setDialog } = useGlobalDialog();
  const { content } = usePaths();
  return currentRootContent && currentRootContent?.length > 0 ? /* @__PURE__ */ jsx13("div", { className: css({ m: 4 }), children: /* @__PURE__ */ jsx13(
    GridList.Container,
    {
      selectionMode: isSelecting ? "multiple" : "none",
      selectionBehavior: "toggle",
      selectedKeys,
      onSelectionChange: setSelectedKeys,
      "aria-label": "Content list",
      children: currentRootContent.map((item, index) => /* @__PURE__ */ jsx13(
        GridList.Item,
        {
          id: isSelecting ? item.contentId : `${item.contentId}-${index}`,
          href: isSelecting ? void 0 : `${content}/${encodeURIComponent(item.contentId)}`,
          textValue: item.displayName,
          children: /* @__PURE__ */ jsxs9(
            "div",
            {
              className: css({
                display: "flex",
                justifyContent: "space-between",
                minWidth: "full"
              }),
              children: [
                /* @__PURE__ */ jsxs9(
                  "div",
                  {
                    className: css({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2
                    }),
                    children: [
                      /* @__PURE__ */ jsx13(
                        "div",
                        {
                          className: css({
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            width: 6
                          }),
                          children: isSelecting ? /* @__PURE__ */ jsx13(GridList.Checkbox, { slot: "selection" }) : /* @__PURE__ */ jsx13(icon_default, { name: "File" })
                        }
                      ),
                      /* @__PURE__ */ jsxs9(
                        "div",
                        {
                          className: css({ display: "flex", flexDirection: "column" }),
                          children: [
                            /* @__PURE__ */ jsx13(
                              "span",
                              {
                                className: css({
                                  fontWeight: "500"
                                }),
                                children: item.displayName
                              }
                            ),
                            /* @__PURE__ */ jsx13(
                              "span",
                              {
                                className: css({
                                  textStyle: "caption",
                                  opacity: 0.8
                                }),
                                children: item.contentId
                              }
                            )
                          ]
                        }
                      )
                    ]
                  }
                ),
                !isSelecting ? /* @__PURE__ */ jsxs9(
                  Menu,
                  {
                    buttonSlot: /* @__PURE__ */ jsx13(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx13(icon_default, { name: "Ellipsis" }) }),
                    children: [
                      /* @__PURE__ */ jsxs9(
                        MenuItem,
                        {
                          onAction: () => setDialog({
                            type: "delete-content",
                            values: { contentId: item.contentId }
                          }),
                          children: [
                            /* @__PURE__ */ jsx13(MenuItemIcon, { name: "Pencil" }),
                            /* @__PURE__ */ jsx13("span", { children: "Edit name" })
                          ]
                        }
                      ),
                      /* @__PURE__ */ jsxs9(
                        MenuItem,
                        {
                          onAction: () => setDialog({
                            type: "delete-content",
                            values: { contentId: item.contentId }
                          }),
                          children: [
                            /* @__PURE__ */ jsx13(MenuItemIcon, { name: "Trash" }),
                            /* @__PURE__ */ jsx13("span", { children: "Delete" })
                          ]
                        }
                      )
                    ]
                  }
                ) : null
              ]
            }
          )
        },
        isSelecting ? item.contentId : `${item.contentId}-${index}`
      ))
    }
  ) }) : /* @__PURE__ */ jsx13(NoContent, {});
};

// pages/content/editor.tsx
import { useMutation as useMutation2, useQuery as useQuery3, useQueryClient as useQueryClient2 } from "@tanstack/react-query";
import "lucide-react";

// controls.ts
var CONTROL_TYPES = {
  CHILDREN: "CHILDREN",
  STRING: "STRING",
  RICH_TEXT: "RICH_TEXT",
  HREF: "HREF"
};
function children() {
  return CONTROL_TYPES.CHILDREN;
}
function string() {
  return CONTROL_TYPES.STRING;
}
function richtext() {
  return CONTROL_TYPES.RICH_TEXT;
}
function href() {
  return CONTROL_TYPES.HREF;
}

// components/component-mapper.tsx
import { jsx as jsx14, jsxs as jsxs10 } from "react/jsx-runtime";
var ComponentMapper = ({
  componentData
}) => {
  const componentMap = useComponents();
  return componentData.map((component) => {
    if (!component) {
      return null;
    }
    if (component?.type in componentMap) {
      const Component = componentMap[component.type].component;
      if (!component?.controls) {
        return /* @__PURE__ */ jsx14(Component, {}, component.componentId);
      }
      if ("children" in component.controls && Array.isArray(component.controls.children)) {
        const { children: children3, ...otherControls } = component.controls;
        return /* @__PURE__ */ jsx14(Component, { ...otherControls, children: /* @__PURE__ */ jsx14(ComponentRenderer, { componentData: children3 }) }, component.componentId);
      }
      return /* @__PURE__ */ jsx14(Component, { ...component.controls }, component.componentId);
    } else {
      return /* @__PURE__ */ jsxs10("p", { children: [
        "Component ",
        component.type,
        " Not Defined"
      ] }, component.componentId);
    }
  });
};
var ComponentRenderer = ({
  componentData,
  layout
}) => {
  const layoutMap = useLayouts();
  if (!layout) {
    return /* @__PURE__ */ jsx14(ComponentMapper, { componentData });
  }
  const LayoutComponent = layoutMap[layout]?.component;
  if (!LayoutComponent) {
    return /* @__PURE__ */ jsx14(ComponentMapper, { componentData });
  } else {
    return /* @__PURE__ */ jsx14(LayoutComponent, { className: css({ height: "70vh", overflow: "scroll" }), children: /* @__PURE__ */ jsx14(ComponentMapper, { componentData }) });
  }
};

// pages/content/editor.tsx
import { useDragAndDrop } from "react-aria-components";
import { Fragment as Fragment4, jsx as jsx15, jsxs as jsxs11 } from "react/jsx-runtime";
var EditorPage = () => {
  const studioClient = useStudioClient();
  const params = useParams();
  const { setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient2();
  const contentId = params.contentId;
  const layoutMap = useLayouts();
  const layoutOptions = Object.keys(layoutMap).map((layoutType) => ({
    label: layoutMap[layoutType]?.displayName || layoutType,
    value: layoutType
  }));
  const {
    data: componentsData,
    isLoading: componentsLoading,
    isError: componentsError
  } = useQuery3({
    queryKey: ["getComponentsByContentId", contentId],
    queryFn: async () => await studioClient.getComponentsByContentId({
      contentId
    })
  });
  const {
    data: contentData,
    isLoading: contentLoading,
    isError: contentError
  } = useQuery3({
    queryKey: ["getContentById", contentId],
    queryFn: async () => await studioClient.getContentById({
      contentId
    })
  });
  const { mutate: updatePreviewLayout } = useMutation2({
    mutationFn: async (vars) => await studioClient.updatePreviewLayout(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getContentById", contentId]
      });
      queryClient2.setQueryData(
        ["getContentById", contentId],
        (oldData) => ({
          content: { ...oldData?.content, previewLayout: vars.previewLayout }
        })
      );
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({
        queryKey: ["getContentById", contentId]
      });
    }
  });
  if (componentsError || contentError)
    return /* @__PURE__ */ jsxs11(
      "div",
      {
        className: css({
          w: "full",
          h: "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center"
        }),
        children: [
          /* @__PURE__ */ jsx15(
            icon_default,
            {
              name: "Frown",
              size: 100,
              className: css({ opacity: 0.2, mb: 5 })
            }
          ),
          /* @__PURE__ */ jsx15("p", { className: css({ textStyle: "2xl" }), children: "Sorry, something went wrong. Please try again later." })
        ]
      }
    );
  return /* @__PURE__ */ jsxs11(Fragment4, { children: [
    /* @__PURE__ */ jsxs11(Toolbar, { children: [
      /* @__PURE__ */ jsx15(
        "div",
        {
          className: css({
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center"
          })
        }
      ),
      /* @__PURE__ */ jsxs11(
        "div",
        {
          className: css({
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            alignItems: "center"
          }),
          children: [
            contentLoading ? /* @__PURE__ */ jsx15(
              Select,
              {
                buttonSize: "sm",
                buttonVariant: "ghost",
                defaultSelectedKey: "loading",
                items: [{ label: "Loading", value: "loading" }],
                isDisabled: true
              }
            ) : null,
            contentData?.content ? /* @__PURE__ */ jsx15(
              Select,
              {
                buttonSize: "sm",
                buttonVariant: "ghost",
                defaultSelectedKey: contentData.content.previewLayout || "",
                items: [...layoutOptions, { label: "None", value: "" }],
                onSelectionChange: (key) => {
                  updatePreviewLayout({
                    previewLayout: key,
                    contentId
                  });
                }
              }
            ) : null,
            /* @__PURE__ */ jsxs11(
              Button,
              {
                onPress: () => {
                  setDialog({ type: "publish-content", values: { contentId } });
                },
                variant: "ghost",
                size: "sm",
                children: [
                  /* @__PURE__ */ jsx15(icon_default, { name: "ArrowUpFromLine", className: css({ mr: 2 }) }),
                  "Publish"
                ]
              }
            )
          ]
        }
      )
    ] }),
    componentsLoading ? /* @__PURE__ */ jsx15(
      "div",
      {
        className: css({
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          h: "85vh"
        }),
        children: /* @__PURE__ */ jsx15(
          icon_default,
          {
            name: "Loader",
            size: 50,
            className: css({
              animation: "spin",
              animationDuration: "2s",
              opacity: 0.5
            })
          }
        )
      }
    ) : /* @__PURE__ */ jsx15(
      Editor,
      {
        components: componentsData?.components,
        selectedLayout: contentData?.content?.previewLayout || ""
      }
    )
  ] });
};
var Editor = ({
  components,
  selectedLayout
}) => {
  const params = useParams();
  const studioClient = useStudioClient();
  const { dialog, setDialog } = useGlobalDialog();
  const queryClient2 = useQueryClient2();
  const { mutate } = useMutation2({
    mutationFn: async (vars) => await studioClient.updateComponentOrder(vars),
    onMutate: async (vars) => {
      await queryClient2.cancelQueries({
        queryKey: ["getComponentsByContentId", contentId]
      });
      queryClient2.setQueryData(
        ["getComponentsByContentId", contentId],
        (oldData) => ({
          components: vars.componentOrder.map(
            (componentId) => oldData?.components.find((c) => c.componentId === componentId)
          )
        })
      );
    },
    onSuccess: () => {
      queryClient2.invalidateQueries({
        queryKey: ["getComponentsByContentId", dialog.values?.contentId]
      });
    }
  });
  const contentId = params.contentId;
  let { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) => [...keys].map((key) => ({
      "text/plain": components?.find((c) => c.componentId === key)?.componentId
    })),
    onReorder(e) {
      const newOrder = move(
        e.target.key,
        e.keys,
        components,
        e.target.dropPosition
      );
      mutate({
        contentId,
        componentOrder: newOrder.map((c) => c.componentId)
      });
    }
  });
  return /* @__PURE__ */ jsxs11("div", { className: css({ display: "flex" }), children: [
    /* @__PURE__ */ jsxs11(
      "div",
      {
        className: css({
          flex: 1,
          p: 2,
          borderRight: "2px solid",
          borderColor: "background2",
          h: "calc(100vh - calc(var(--vestia-sizes-12) + var(--vestia-sizes-14)))",
          boxSizing: "border-box",
          overflow: "scroll",
          scrollbar: "hidden"
        }),
        children: [
          components && components.length > 0 ? /* @__PURE__ */ jsx15(
            GridList.Container,
            {
              "aria-label": "Components list",
              selectionMode: "none",
              items: components,
              dragAndDropHooks,
              className: css.raw({ marginBottom: "40px" }),
              children: (item) => /* @__PURE__ */ jsx15(GridList.Item, { id: item.componentId, textValue: item.displayName, children: /* @__PURE__ */ jsxs11(
                "div",
                {
                  className: css({
                    display: "flex",
                    justifyContent: "space-between",
                    minWidth: "full"
                  }),
                  children: [
                    item.displayName,
                    /* @__PURE__ */ jsxs11(
                      Menu,
                      {
                        buttonSlot: /* @__PURE__ */ jsx15(Button, { variant: "ghost", size: "icon", children: /* @__PURE__ */ jsx15(icon_default, { name: "Ellipsis" }) }),
                        children: [
                          /* @__PURE__ */ jsxs11(
                            MenuItem,
                            {
                              onAction: () => setDialog({
                                type: "edit-component",
                                values: {
                                  contentId: item.contentId,
                                  componentId: item.componentId,
                                  type: item.type,
                                  displayName: item.displayName,
                                  controls: item.controls
                                }
                              }),
                              children: [
                                /* @__PURE__ */ jsx15(MenuItemIcon, { name: "Pencil" }),
                                /* @__PURE__ */ jsx15("span", { children: "Edit" })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxs11(
                            MenuItem,
                            {
                              onAction: () => setDialog({
                                type: "create-component",
                                values: {
                                  contentId: item.contentId,
                                  position: components.findIndex(
                                    (component) => component.componentId === item.componentId
                                  )
                                }
                              }),
                              children: [
                                /* @__PURE__ */ jsx15(MenuItemIcon, { name: "ArrowUpToLine" }),
                                /* @__PURE__ */ jsx15("span", { children: "Insert before" })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxs11(
                            MenuItem,
                            {
                              onAction: () => {
                                const position = components.findIndex(
                                  (component) => component.componentId === item.componentId
                                ) + 1;
                                console.log(position);
                                setDialog({
                                  type: "create-component",
                                  values: {
                                    contentId: item.contentId,
                                    position
                                  }
                                });
                              },
                              children: [
                                /* @__PURE__ */ jsx15(MenuItemIcon, { name: "ArrowDownToLine" }),
                                /* @__PURE__ */ jsx15("span", { children: "Insert after" })
                              ]
                            }
                          ),
                          /* @__PURE__ */ jsxs11(
                            MenuItem,
                            {
                              onAction: () => setDialog({
                                type: "delete-component",
                                values: {
                                  contentId: item.contentId,
                                  componentId: item.componentId
                                }
                              }),
                              children: [
                                /* @__PURE__ */ jsx15(MenuItemIcon, { name: "Trash" }),
                                /* @__PURE__ */ jsx15("span", { children: "Delete" })
                              ]
                            }
                          )
                        ]
                      }
                    )
                  ]
                }
              ) })
            }
          ) : /* @__PURE__ */ jsxs11(
            "div",
            {
              className: css({
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2
              }),
              children: [
                /* @__PURE__ */ jsx15(icon_default, { name: "Plus", size: 20, className: css({ opacity: 0.2 }) }),
                /* @__PURE__ */ jsx15(
                  "p",
                  {
                    className: css({ textAlign: "center", padding: 0, opacity: 0.8 }),
                    children: "Get started by adding a component"
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx15(
            Button,
            {
              className: css({ w: "full", position: "sticky", bottom: 0 }),
              onPress: () => setDialog({ type: "create-component", values: { contentId } }),
              children: "Add component"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx15(
      "div",
      {
        className: css({
          flex: 3,
          h: "calc(100vh - calc(var(--vestia-sizes-12) + var(--vestia-sizes-14)))",
          w: 0,
          overflow: "scroll",
          scrollbar: "hidden"
        }),
        children: components && components.length > 0 ? /* @__PURE__ */ jsx15(
          ComponentRenderer,
          {
            componentData: components,
            layout: selectedLayout
          }
        ) : /* @__PURE__ */ jsxs11(
          "div",
          {
            className: css({
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.6,
              gap: 2,
              mt: 20
            }),
            children: [
              /* @__PURE__ */ jsx15(
                icon_default,
                {
                  name: "SatelliteDish",
                  size: 100,
                  className: css({ opacity: 0.2, mb: 5 })
                }
              ),
              /* @__PURE__ */ jsx15("p", { children: "Nothing to preview yet!" })
            ]
          }
        )
      }
    )
  ] });
};

// pages/content/index.tsx
import { jsx as jsx16 } from "react/jsx-runtime";
var Layout = ({ children: children3 }) => {
  const searchParams = useSearchParams();
  const prefix = searchParams.get("prefix");
  const { content } = usePaths();
  const params = useParams();
  let items = [];
  if (params.contentId) {
    items = params.contentId.split("/");
  } else if (prefix) {
    items = prefix.split("/");
  } else {
    items = [];
  }
  const breadcrumbs = items.map((item, index) => {
    const isLeafNode = Boolean(params.contentId) && index === items.length - 1;
    return {
      text: item,
      href: !isLeafNode ? `${content}?prefix=${items.slice(0, index + 1).join("/")}` : null,
      isLeafNode
    };
  });
  return /* @__PURE__ */ jsx16(PageLayout, { header: /* @__PURE__ */ jsx16(Breadcrumbs, { breadcrumbs }), children: children3 });
};
var Content2 = {
  Layout,
  DirectoryPage,
  EditorPage
};

// config.ts
import "react-aria-components";
var defineConfig = (config) => config;
export {
  Button,
  Content2 as Content,
  GridList,
  Login,
  PageLayout,
  PageTitle,
  SideNav,
  StudioProvider,
  authHandler,
  children,
  defineConfig,
  href,
  richtext,
  string
};
