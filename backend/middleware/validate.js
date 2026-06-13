const isValidUrl = (string) => {
  try {
    // Basic regex checking for URL pattern (handling http/https protocols)
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
      'i'
    );
    return !!urlPattern.test(string);
  } catch (e) {
    return false;
  }
};

exports.validateUrlCreation = (req, res, next) => {
  const { originalUrl, customAlias } = req.body;

  if (!originalUrl) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an originalUrl'
    });
  }

  // Prepend http:// if protocol is missing for redirect compliance
  let normalizedUrl = originalUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  if (!isValidUrl(normalizedUrl)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid URL format'
    });
  }

  req.body.originalUrl = normalizedUrl;

  // Validate customAlias if provided
  if (customAlias) {
    const aliasTrimmed = customAlias.trim();
    // Check if alias contains only alphanumeric, dashes, and underscores
    const aliasRegex = /^[a-zA-Z0-9-_]+$/;
    if (!aliasRegex.test(aliasTrimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Custom alias must contain only letters, numbers, dashes, and underscores'
      });
    }
    
    if (aliasTrimmed.length < 3 || aliasTrimmed.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Custom alias must be between 3 and 30 characters'
      });
    }
    req.body.customAlias = aliasTrimmed.toLowerCase(); // normalize alias to lowercase
  }

  next();
};
