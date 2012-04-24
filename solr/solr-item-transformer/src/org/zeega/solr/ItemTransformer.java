package org.zeega.solr;

import java.util.Map;
import java.lang.String;

import org.lorecraft.phparser.SerializedPhpParser;

public class ItemTransformer    
{
	public Object transformRow(Map<String, Object> row)     
	{
		String tags = (String)row.get("tags");

		if (tags != null)
        {
    		SerializedPhpParser serializedPhpParser = new SerializedPhpParser(tags);
    		@SuppressWarnings("unchecked")
			Map<Object, Object> res = (Map<Object, Object>) serializedPhpParser.parse();
    		row.put("tags", res.values());
        }

		String attributes = (String)row.get("attributes");

		if (attributes != null)
        {
    		SerializedPhpParser serializedPhpParser = new SerializedPhpParser(attributes);
    		@SuppressWarnings("unchecked")
			Map<Object, Object> res = (Map<Object, Object>) serializedPhpParser.parse();
    		row.put("attributes", res);
        }

        return row;
	}
}