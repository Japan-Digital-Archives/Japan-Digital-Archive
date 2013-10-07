<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class ItemController extends Controller
{
    
    public function indexAction($item_id=NULL)
    {
	    $itemUrl = $this->container->getParameter('api_url')."api/items/$item_id";
	    $item = json_decode(file_get_contents($itemUrl),true);
	    
	    if(isset($item) && isset($item["items"]) && count($item["items"]) > 0)
	    {
	    	$item = $item["items"][0];
	    }
	    
    	$locale=$this->getRequest()->getLocale();
    	$request = $this->getRequest();
      $query=$request->query->get('query');
    	
    	
    	if($item['description']=="")$item['description']="none given";
    	
    	$user = $this->get('security.context')->getToken()->getUser();
    	if(is_object($user))$displayName = $user->getDisplayName();
    	else $displayName='none';
    	//return new Response($query);
    	return $this->render('JDACoreBundle:Item:item.html.twig', array(
					// last displayname entered by the user
					'page'=> 'item',
					'displayname'=>$displayName,
					'item' => $item
				));
    }
}
