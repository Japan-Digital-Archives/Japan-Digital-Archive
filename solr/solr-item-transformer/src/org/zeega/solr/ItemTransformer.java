package org.zeega.solr;

import java.util.Map;
import java.lang.String;

import org.lorecraft.phparser.SerializedPhpParser;

public class ItemTransformer    
{
	public Object transformRow(Map<String, Object> row)     
	{
	    // parse tags (php array)
	    try
	    {
    		String tags = (String)row.get("tags");

    		if (tags != null)
            {
        		SerializedPhpParser serializedPhpParser = new SerializedPhpParser(tags);
        		@SuppressWarnings("unchecked")
    			Map<Object, Object> res = (Map<Object, Object>) serializedPhpParser.parse();
        		row.put("tags", res.values());
            }
        }
        catch(Exception ex) { /* To-do: add logging - ok for now */}
        
        try
	    {
    		String tags = (String)row.get("tags_i");

    		if (tags != null)
            {
        		SerializedPhpParser serializedPhpParser = new SerializedPhpParser(tags);
        		@SuppressWarnings("unchecked")
    			Map<Object, Object> res = (Map<Object, Object>) serializedPhpParser.parse();
        		row.put("tags_i", res.values());
            }
        }
        catch(Exception ex) { /* To-do: add logging - ok for now */}
	    
        // parse attributes (php array)
        try
	    {
    		String attributes = (String)row.get("attributes");

    		if (attributes != null)
            {
        		SerializedPhpParser serializedPhpParser = new SerializedPhpParser(attributes);
        		@SuppressWarnings("unchecked")
    			Map<Object, Object> res = (Map<Object, Object>) serializedPhpParser.parse();
        		row.put("attributes", res);
            }
        }
        catch(Exception ex) { /* To-do: add logging - ok for now */ }
        
        return row;
	}
}